'use client'
import { makeSmallChange } from "@/app/misc/types";
import { useDevice } from "@/app/services/device/use-device";
import { OnChessCoachReply } from "@/app/services/rag-graphql/operation";
import { useRag, useRagSubscription } from "@/app/services/rag-graphql/rag-graphql";
import NoteBook from "@/app/ui/note-book/note-book";
import TextArea from "@/app/ui/text-area/text-area";
import { useEffect, useState } from "react";
// Chat returns the chat system with ai
export default function Chat() {
    let $name = "leoDaCarYellow"
    let $id = "xxx222"
    const [note, setNote] = useState('')
    const [coachNote, setCoachNote] = useState<OnChessCoachReply | undefined>()

    const { askAi } = useRag()
    const { aiReply } = useRagSubscription({
        id: $id,
        name: $name,
        query: note,
    });

    useEffect(() => {
        setCoachNote(aiReply)
    }, [aiReply]);


    const handleSend = async (text: string) => {
        setNote(text)
        try {
            const result = await askAi({
                id: $id,
                query: text,
                name: $name
            });
            console.log("Message sent successfully:", result);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // @ts-ignore
    let _test: OnChessCoachReply = {
        information: {
            desc: "Hello leoDaCarYellow! I've put together a list of some of the best YouTube channels for chess content that I think you'll find incredibly helpful for improving your game and staying entertained. These creators offer a wide range of styles, from beginner-friendly guides to in-depth master game analysis."
        },
        miscItems: [
            {
                key: "yt_gothamchess_channel",
                value: {
                    title: "📺 GothamChess Channel",
                    desc: "Levy Rozman (GothamChess) is known for his engaging and often humorous explanations, making complex concepts accessible. Great for all levels, especially beginners and intermediate players looking to improve in 2025.",
                    canCopy: false,
                    isLink: true,
                    link: "https://www.youtube.com/@GothamChess"
                }
            },
            {
                key: "yt_agadmator_channel",
                value: {
                    title: "📺 Agadmator's Chess Channel",
                    desc: "Ante Saric (Agadmator) provides calm, insightful analysis of famous games, current events, and historical matches. Perfect for those who enjoy in-depth game breakdowns and learning about chess history in 2025.",
                    canCopy: false,
                    isLink: true,
                    link: "https://www.youtube.com/@agadmator"
                }
            },
            {
                key: "yt_naroditsky_channel",
                value: {
                    title: "📺 Daniel Naroditsky (Danya) Channel",
                    desc: "Grandmaster Daniel Naroditsky offers high-level instructive content, including speedruns, game analysis, and detailed opening theory. Excellent for serious improvement and strategic understanding in 2025.",
                    canCopy: false,
                    isLink: true,
                    link: "https://www.youtube.com/@DanielNaroditsky"
                }
            },
            {
                key: "yt_ericrosen_channel",
                value: {
                    title: "📺 Eric Rosen Channel",
                    desc: "Eric Rosen combines fun, educational content with brilliant tactical puzzles and interesting game commentary. His 'Saint Louis Chess Club' content is also top-tier for 2025.",
                    canCopy: false,
                    isLink: true,
                    link: "https://www.youtube.com/@EricRosen"
                }
            },
            {
                key: "yt_video_opening_principles",
                value: {
                    title: "📺 Video: The ULTIMATE Guide To Opening Principles",
                    desc: "This video from GothamChess breaks down the fundamental principles of chess openings in an easy-to-understand way, crucial for building a strong foundation for your games in 2025.",
                    canCopy: false,
                    isLink: true,
                    link: "https://www.youtube.com/watch?v=H7oB1tN3K4A"
                }
            }
        ]
    }
    // @ts-ignore
    const _test2: OnChessCoachReply = {
        information: {
            title: "Welcome, Coach is here!",
            desc: "Hello leoDaCarYellow! Yes, I'm here and ready to help you with your chess journey. What's on your mind today, or what would you like to work on? Let's make 2025 your best chess year yet!"
        },
        miscItems: [
            {
                key: "youtube_fundamentals",
                value: {
                    title: "📺 Chess Fundamentals for Beginners",
                    desc: "This video provides a great overview of essential chess concepts every player should know.",
                    canCopy: false,
                    isLink: true,
                    link: "https://www.youtube.com/watch?v=kCO-92kQ6-o"
                }
            },
            {
                key: "book_mastering_chess",
                value: {
                    title: "📚 Mastering Chess: A Complete Guide",
                    desc: "A comprehensive book covering strategy, tactics, and endgames for aspiring players.",
                    canCopy: false,
                    isLink: false
                }
            },
            {
                key: "fen_sample_middlegame",
                value: {
                    title: "📋 FEN for Middlegame Analysis",
                    desc: "Copy this FEN into your favorite analysis board (like Lichess or Chess.com) to practice your tactical vision in a complex middlegame position.",
                    canCopy: true,
                    isLink: false,
                    copy: "r1bqkb1r/pppn1ppp/3p1n2/4p3/3P4/2NBPN2/PPP2PPP/R1BQK2R b KQkq - 0 5"
                }
            },
            {
                key: "lichess_sicilian_defense",
                value: {
                    title: "🔗 Explore the Sicilian Defense (Lichess)",
                    desc: "Dive into the Sicilian Defense on Lichess's opening explorer to see common variations and master lines.",
                    canCopy: false,
                    isLink: true,
                    link: "https://lichess.org/opening/Sicilian_Defense"
                }
            }
        ]
    }
    // @ts-ignore
    const _test2Note = 'pass me some of the best content creators links on youtube.'

    const { device } = useDevice()
    const btnSizeW = device.isPcLandscape ? 120 : 100;
    const btnSizeH = device.isPcLandscape ? 40 : 35;

    const frameSize = device.isPcLandscape ? 1200 : device.isMobilePortrait ? 450 : device.isMobileLandscape ? 450 : device.isTabletLandscape ? 1200 : 900;

    const proBookW = device.isPcLandscape ? 1500 : device.isMobilePortrait ? 500 : device.isMobileLandscape ? 500 : device.isTabletLandscape ? 1500 : 1200;
    const proBookH = device.isPcLandscape ? 800 : device.isMobilePortrait ? 900 : device.isMobileLandscape ? 900 : device.isTabletLandscape ? 800 : 600;

    const bf = device.isPcLandscape ? 43 : device.isMobilePortrait ? 30 : device.isMobileLandscape ? 30 : device.isTabletLandscape ? 33 : 25
    const frameSheet: makeSmallChange = {
        width: proBookW,
        height: proBookH,
    }
    const blurCap = "12px"

    const editTextAreaSize = device.isPcLandscape ? 1200 : device.isMobilePortrait ? 250 : 450;


    const btnSize = device.isPcLandscape ? 40 : 35;
    const bubbleMessageSheet: makeSmallChange = {
        width: btnSizeW,
        height: btnSizeH,
        blurEffect: true,
        blurCap: blurCap,
        frameSize: editTextAreaSize,
        fontSize: bf,
        size: btnSize,
        btnTextColor: 'white'
    }

    const f = device.isPcLandscape ? 95 : device.isMobilePortrait ? 55 : 55;
    const textAreaSheet: makeSmallChange = {
        width: btnSizeW,
        height: btnSizeH,
        blurEffect: true,
        blurCap: blurCap,
        frameSize: frameSize,
        fontSize: f,
        size: btnSize,
        btnTextColor: 'white',
        textColor: 'black'
    }

    return (
        <>
            <div className="inset-0 h-screen flex flex-col justify-center items-center p-1 gap-2">

                <NoteBook
                    makeFrameSmallChange={frameSheet}
                    makeWriterSmallChange={bubbleMessageSheet}
                    makeMessageBubbleSmallChange={bubbleMessageSheet}
                    note={coachNote}
                    userNote={note}
                    onReask={handleSend}
                ></NoteBook>

                <div className="w-full flex flex-col justify-center items-center">
                    <TextArea
                        get={handleSend}
                        makeSmallChanges={textAreaSheet}
                    ></TextArea>
                </div>
            </div>
        </>
    )
}