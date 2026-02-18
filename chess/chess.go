package chess

import (
	"app/chess/graph/model"
	"database/sql"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

func Chess() error {
	basePath, _ := os.Getwd()
	csvPath := filepath.Join(basePath, "chess", "chess_puzzles", "puzzle_db1.csv")

	fs, err := os.Open(csvPath)
	if err != nil {
		log.Fatal(err)
	}
	defer fs.Close()

	db, err := sql.Open("sqlite", "chess_puzzleDB1.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	checkStmt, _ := db.Prepare("SELECT fen FROM puzzles WHERE id = ?")
	insertStmt, _ := db.Prepare("INSERT INTO puzzles (id, fen, moves, rating, popularity, themes) VALUES (?, ?, ?, ?, ?, ?)")

	reader := csv.NewReader(fs)
	reader.Read() // Skip header

	tx, _ := db.Begin()
	updateStmt, _ := tx.Prepare(`UPDATE puzzles SET fen=?, moves=?, rating=?, popularity=?, themes=? WHERE id=?`)
	count := 0
	newInserts := 0

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}

		id := record[0]
		fen := record[1]

		var existingFen string
		err = tx.Stmt(checkStmt).QueryRow(id).Scan(&existingFen)

		switch true {
		case err == sql.ErrNoRows:
			_, err = tx.Stmt(insertStmt).Exec(id, fen, record[2], record[3], record[5], record[7])
			newInserts++
		case existingFen != fen:
			_, err = tx.Stmt(updateStmt).Exec(id, fen, record[2], record[3], record[5], record[7])
			log.Printf("Puzzle %s has changed FEN", id)
		default:
			log.Println("already commited", id)
			continue
		}

		count++
		if count%10000 == 0 {
			log.Printf("Processed %d rows... (%d new inserts)", count, newInserts)
		}
	}
	tx.Commit()
	log.Printf("Sync complete. Total new records added: %d", newInserts)
	return err
}

func GetPuzzle(limit int) []*model.Puzzle {
	db, err := sql.Open("sqlite", "chess_puzzleDB1.db")
	if err != nil {
		log.Println("DB Open Error:", err)
		return nil
	}
	defer db.Close()

	var puzzles []*model.Puzzle

	query := fmt.Sprintf("SELECT id, fen, moves, rating, popularity, themes FROM puzzles LIMIT %d", limit)
	rows, err := db.Query(query)
	if err != nil {
		log.Println("Query Error:", err)
		return nil
	}
	defer rows.Close()

	for rows.Next() {
		var p model.Puzzle
		err := rows.Scan(&p.ID, &p.Fen, &p.Moves, &p.Rating, &p.Popularity, &p.Themes)
		if err != nil {
			log.Println("Scan Error:", err)
			continue
		}
		puzzles = append(puzzles, &p)
	}

	return puzzles
}
