import { type NextRequest, NextResponse } from "next/server"

const STRAPI_URL = "https://strapi-elearning-8rff.onrender.com"
const STRAPI_TOKEN =
  process.env.STRAPI_API_TOKEN ||
  "992949dd37394d8faa798febe2bcd19c61aaa07c1b30873b4fe6cc4c6dce0db003fee18d71e12ec0ac5af64c61ffca2b4069eff02d5f3bfbe744a4dd6eab540a53479d68375cf0a3f2ee4231c245e5d1b09ae58356ef2744a3757bc3ca01a6189fe687cd06517aaa3b1e91a28f8a943a1c97abe4958ded8d7e99b376d8203277"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 === QUIZSETS API DEBUG INFO ===")
    console.log("🌐 Strapi URL:", STRAPI_URL)
    console.log("🔑 API Token present:", !!STRAPI_TOKEN)

    if (!STRAPI_TOKEN) {
      console.error("❌ STRAPI_API_TOKEN is missing!")
      throw new Error("STRAPI_API_TOKEN environment variable is not set")
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    // 🎯 DIREKTE QUIZSETS API ABFRAGE mit populate=*
    const quizsetsUrl = `${STRAPI_URL}/api/quizsets?populate=*`
    console.log("📡 Making request to Quizsets API:", quizsetsUrl)

    const response = await fetch(quizsetsUrl, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("💥 Quizsets API error:", response.status, response.statusText, errorText)
      throw new Error(`Strapi returned ${response.status}: ${response.statusText}`)
    }

    const quizsetsData = await response.json()
    console.log("📊 Raw Strapi Quizsets Response:")
    console.log("📊 Total items from API:", quizsetsData.data?.length || 0)

    // 🔍 LOG COMPLETE API STRUCTURE
    console.log("🔍 Complete API Response Structure:")

    // 🔍 SUCHE NACH SPEZIFISCHEM TEXT
    console.log("\n🔍 === SEARCHING FOR SPECIFIC TEXT ===")
    const searchText = "Der Text hier ist eine der möglichen Antworten"

    quizsetsData.data.forEach((quizItem, index) => {
      console.log(`\n🔍 === Analyzing Quiz Item ${index + 1} (ID: ${quizItem.id}) ===`)
      const attributes = quizItem.attributes || quizItem

      // Suche in allen möglichen Feldern
      const searchInObject = (obj, path = "") => {
        if (typeof obj === "string" && obj.includes(searchText)) {
          console.log(`🎯 FOUND TEXT at path: ${path}`)
          console.log(`🎯 Full text: "${obj}"`)
          return true
        }

        if (typeof obj === "object" && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            if (searchInObject(value, path ? `${path}.${key}` : key)) {
              return true
            }
          }
        }

        return false
      }

      // Durchsuche das gesamte Quiz-Item
      if (searchInObject(quizItem, `quizItem[${index}]`)) {
        console.log(`\n📋 COMPLETE STRUCTURE OF ITEM WITH SEARCH TEXT:`)
        console.log(JSON.stringify(quizItem, null, 2))
      }

      // Spezielle Analyse der auswahl/antwort Struktur
      const auswahl = attributes.auswahl
      if (auswahl && Array.isArray(auswahl)) {
        console.log(`📋 Auswahl array has ${auswahl.length} items:`)
        auswahl.forEach((option, optionIndex) => {
          console.log(`   Option ${optionIndex + 1}:`)
          console.log(`     Complete option:`, JSON.stringify(option, null, 2))

          // Prüfe alle möglichen Felder
          const possibleFields = ["antwort", "text", "content", "answer", "option", "value", "label"]
          possibleFields.forEach((field) => {
            if (option[field]) {
              console.log(`     ${field}: "${option[field]}"`)
              if (option[field].includes && option[field].includes(searchText)) {
                console.log(`     🎯 FOUND SEARCH TEXT in field: ${field}`)
              }
            }
          })
        })
      }
    })

    console.log(JSON.stringify(quizsetsData, null, 2))

    if (!quizsetsData || !quizsetsData.data || !Array.isArray(quizsetsData.data)) {
      console.error("❌ Invalid data structure from Strapi:", quizsetsData)
      throw new Error("Invalid data structure from Strapi")
    }

    // 🎯 NEUE TRANSFORMATION BASIEREND AUF STRAPI STRUKTUR
    const transformedData = {
      data: [], // Array für alle Quiz-Items
      byModule: {}, // Gruppiert nach Modul-ID
    }

    quizsetsData.data.forEach((quizItem, index) => {
      console.log(`\n🔍 === Processing Quiz Item ${index + 1} ===`)
      console.log("📝 Raw Quiz Item:", JSON.stringify(quizItem, null, 2))

      const attributes = quizItem.attributes || quizItem

      // 🎯 EXTRAHIERE FRAGE
      const frage = attributes.frage || `Frage ${quizItem.id}`
      console.log(`❓ Frage: "${frage}"`)

      // 🎯 EXTRAHIERE AUSWAHL (ANTWORTOPTIONEN)
      const auswahl = attributes.auswahl || []
      console.log(`📋 Auswahl (${auswahl.length} Optionen):`)

      const options = []
      let correctAnswerIndex = -1

      auswahl.forEach((option, optionIndex) => {
        const optionText = option.antwort || `Option ${optionIndex + 1}`
        const isCorrect = option.isCorrect === true

        options.push(optionText)

        if (isCorrect) {
          correctAnswerIndex = optionIndex
        }

        console.log(`   ${optionIndex + 1}. "${optionText}" ${isCorrect ? "✅ (RICHTIG)" : "❌ (FALSCH)"}`)
        console.log(`      Raw option.antwort: "${option.antwort}"`)
        console.log(`      Raw option structure:`, JSON.stringify(option, null, 2))
      })

      // Fallback falls keine korrekte Antwort markiert ist
      if (correctAnswerIndex === -1) {
        correctAnswerIndex = 0
        console.warn(`⚠️ No correct answer found for "${frage}", using first option as correct`)
      }

      // 🎯 EXTRAHIERE MODUL-REFERENZ
      let moduleId = null
      let moduleTitle = "Unbekanntes Modul"

      // Verschiedene Wege zur Modul-Extraktion
      if (attributes.module?.data?.id) {
        moduleId = attributes.module.data.id
        moduleTitle = attributes.module.data.attributes?.title || moduleTitle
      } else if (attributes.module?.id) {
        moduleId = attributes.module.id
        moduleTitle = attributes.module.title || moduleTitle
      } else if (attributes.modules?.data && attributes.modules.data.length > 0) {
        moduleId = attributes.modules.data[0].id
        moduleTitle = attributes.modules.data[0].attributes?.title || moduleTitle
      }

      console.log(`🔗 Module ID: ${moduleId}`)
      console.log(`📚 Module Title: ${moduleTitle}`)

      // 🎯 ERSTELLE TRANSFORMIERTES QUIZ-ITEM
      const transformedItem = {
        id: quizItem.id,
        frage: frage,
        auswahl: auswahl,
        options: options,
        correctAnswer: correctAnswerIndex,
        order: attributes.order || 0,
        module: {
          id: moduleId,
          title: moduleTitle,
          documentId: attributes.module?.data?.documentId || attributes.module?.documentId,
        },
        createdAt: attributes.createdAt,
        updatedAt: attributes.updatedAt,
      }

      // Füge zu Gesamt-Array hinzu
      transformedData.data.push(transformedItem)

      // Gruppiere nach Modul-ID
      if (moduleId) {
        if (!transformedData.byModule[moduleId]) {
          transformedData.byModule[moduleId] = {
            moduleId: moduleId,
            moduleTitle: moduleTitle,
            questions: [],
            passingScore: 70,
            timeLimit: null,
            difficulty: "medium",
          }
        }

        transformedData.byModule[moduleId].questions.push({
          id: quizItem.id,
          question: frage,
          options: options,
          correctAnswer: correctAnswerIndex,
          order: attributes.order || 0,
          explanation: attributes.explanation || "",
        })

        console.log(`✅ Added to module ${moduleId} group`)
      } else {
        console.warn(`⚠️ Quiz item ${quizItem.id} has no module reference`)
      }
    })

    // 🎯 SORTIERE FRAGEN NACH ORDER
    Object.keys(transformedData.byModule).forEach((moduleId) => {
      transformedData.byModule[moduleId].questions.sort((a, b) => a.order - b.order)
      console.log(
        `📚 Module ${moduleId}: ${transformedData.byModule[moduleId].questions.length} questions sorted by order`,
      )
    })

    console.log("\n🎯 === FINAL TRANSFORMATION RESULTS ===")
    console.log(`📊 Total quiz items processed: ${transformedData.data.length}`)
    console.log(`📚 Modules with quizzes: ${Object.keys(transformedData.byModule).length}`)
    console.log(`📋 Module IDs with quizzes: [${Object.keys(transformedData.byModule).join(", ")}]`)

    Object.keys(transformedData.byModule).forEach((moduleId) => {
      const moduleData = transformedData.byModule[moduleId]
      console.log(`\n📚 Module ${moduleId} (${moduleData.moduleTitle}):`)
      moduleData.questions.forEach((q, idx) => {
        console.log(`   ${idx + 1}. "${q.question}"`)
        console.log(`      Options: [${q.options.join(", ")}]`)
        console.log(`      Correct: "${q.options[q.correctAnswer]}" (index: ${q.correctAnswer})`)
      })
    })

    // 🎯 RETURN BOTH FORMATS
    return NextResponse.json({
      data: transformedData.data, // Original format für Kompatibilität
      byModule: transformedData.byModule, // Gruppiert nach Modul
      meta: {
        totalItems: transformedData.data.length,
        totalModules: Object.keys(transformedData.byModule).length,
        moduleIds: Object.keys(transformedData.byModule).map((id) => Number.parseInt(id)),
      },
    })
  } catch (error) {
    console.error("💥 Quizsets API error:", error)

    // Fallback zu lokalen Quizsets
    const fallbackQuizsets = {
      data: [
        {
          id: 1,
          frage: "Was ist Smart Nexus?",
          auswahl: [
            { Frage: "ERP System", isCorrect: false },
            { Frage: "CRM System", isCorrect: false },
            { Frage: "ERP & CRM System", isCorrect: true },
            { Frage: "Nur ein Tool", isCorrect: false },
          ],
          options: ["ERP System", "CRM System", "ERP & CRM System", "Nur ein Tool"],
          correctAnswer: 2,
          order: 1,
          module: { id: 1, title: "Smart Nexus Grundlagen" },
        },
      ],
      byModule: {
        1: {
          moduleId: 1,
          moduleTitle: "Smart Nexus Grundlagen",
          questions: [
            {
              id: 1,
              question: "Was ist Smart Nexus?",
              options: ["ERP System", "CRM System", "ERP & CRM System", "Nur ein Tool"],
              correctAnswer: 2,
              order: 1,
              explanation: "Smart Nexus ist eine kombinierte ERP & CRM Lösung",
            },
          ],
          passingScore: 70,
          timeLimit: null,
          difficulty: "easy",
        },
      },
      meta: {
        totalItems: 1,
        totalModules: 1,
        moduleIds: [1],
      },
    }

    console.log("🔄 Using fallback quizsets data")
    return NextResponse.json(fallbackQuizsets)
  }
}
