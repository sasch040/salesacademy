import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  "992949dd37394d8faa798febe2bcd19c61aaa07c1b30873b4fe6cc4c6dce0db003fee18d71e12ec0ac5af64c61ffca2b4069eff02d5f3bfbe744a4dd6eab540a53479d68375cf0a3f2ee4231c245e5d1b09ae58356ef2744a3757bc3ca01a6189fe687cd06517aaa3b1e91a28f8a943a1c97abe4958ded8d7e99b376d8203277"

export async function GET(request: NextRequest, { params }: { params: { moduleId: string } }) {
  const moduleId = params.moduleId
  console.log(`🧠 === QUIZ API: Loading quiz for module ${moduleId} ===`)

  try {
    // 1. Lade das Modul um die Quizset-Referenz zu finden
    const moduleResponse = await fetch(`${STRAPI_URL}/api/modules/${moduleId}?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!moduleResponse.ok) {
      throw new Error(`Module not found: ${moduleResponse.status}`)
    }

    const moduleData = await moduleResponse.json()
    const moduleAttributes = moduleData.data?.attributes || moduleData.data

    console.log(`📚 Module found: ${moduleAttributes?.title}`)

    // 2. Finde Quizset-Referenz
    let quizsetId = null
    if (moduleAttributes?.quizset) {
      quizsetId = moduleAttributes.quizset.data?.id || moduleAttributes.quizset.id || moduleAttributes.quizset
    }

    console.log(`🔍 Quizset ID: ${quizsetId}`)

    if (!quizsetId) {
      // Fallback Quiz
      return NextResponse.json({
        id: 1,
        title: `Quiz für ${moduleAttributes?.title || "Modul"}`,
        questions: [
          {
            id: 1,
            question: `Was haben Sie in "${moduleAttributes?.title || "diesem Modul"}" gelernt?`,
            options: ["Grundlagen", "Erweiterte Konzepte", "Praktische Anwendung", "Alle Antworten"],
            correctAnswer: 3,
            explanation: "Dieses Modul deckt alle wichtigen Aspekte ab.",
          },
        ],
        passingScore: 70,
        difficulty: "medium",
      })
    }

    // 3. Lade das Quizset
    const quizsetResponse = await fetch(`${STRAPI_URL}/api/quizsets/${quizsetId}?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (!quizsetResponse.ok) {
      throw new Error(`Quizset not found: ${quizsetResponse.status}`)
    }

    const quizsetData = await quizsetResponse.json()
    const quizsetAttributes = quizsetData.data?.attributes || quizsetData.data

    console.log(`🧠 Quizset found: ${quizsetAttributes?.frage}`)
    console.log(`📋 Auswahl count: ${quizsetAttributes?.auswahl?.length || 0}`)

    // 4. Transformiere Quiz-Daten
    const questions = []

    if (quizsetAttributes?.frage && quizsetAttributes?.auswahl && Array.isArray(quizsetAttributes.auswahl)) {
      let correctAnswerIndex = 0
      const options = quizsetAttributes.auswahl.map((option, index) => {
        const optionText = option.antwort || option.text || `Option ${index + 1}`
        if (option.isCorrect === true) {
          correctAnswerIndex = index
        }
        console.log(`   Option ${index}: "${optionText}" ${option.isCorrect ? "(CORRECT)" : ""}`)
        return optionText
      })

      questions.push({
        id: 1,
        question: quizsetAttributes.frage,
        options: options,
        correctAnswer: correctAnswerIndex,
        explanation: quizsetAttributes.explanation || "",
      })

      console.log(`✅ Quiz processed successfully`)
      console.log(`❓ Question: "${quizsetAttributes.frage}"`)
      console.log(`🎯 Correct Answer: "${options[correctAnswerIndex]}" (index: ${correctAnswerIndex})`)
    }

    const quiz = {
      id: quizsetData.data?.id || quizsetId,
      title: quizsetAttributes?.title || quizsetAttributes?.frage || "Quiz",
      questions: questions,
      passingScore: quizsetAttributes?.passingScore || 70,
      timeLimit: quizsetAttributes?.timeLimit,
      difficulty: quizsetAttributes?.difficulty || "medium",
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error("💥 Quiz API error:", error)

    // Fallback Quiz
    return NextResponse.json({
      id: 1,
      title: "Fallback Quiz",
      questions: [
        {
          id: 1,
          question: "Was ist das Hauptziel dieses Moduls?",
          options: ["Grundlagen lernen", "Praktische Anwendung", "Vertiefung", "Alle Antworten"],
          correctAnswer: 3,
          explanation: "Dieses Modul deckt alle wichtigen Aspekte ab.",
        },
      ],
      passingScore: 70,
      difficulty: "medium",
    })
  }
}
