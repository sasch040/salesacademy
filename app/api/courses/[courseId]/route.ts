import { type NextRequest, NextResponse } from "next/server"

// 🔍 ENV CHECK: Strapi Konfiguration
console.log("\n🌍 === ENVIRONMENT CONFIGURATION ===");
console.log("🔐 STRAPI_URL:           ", process.env.STRAPI_URL || "❌ NOT SET");
console.log("🔐 STRAPI_API_TOKEN:     ", process.env.STRAPI_API_TOKEN ? "✅ SET (length: " + process.env.STRAPI_API_TOKEN.length + ")" : "❌ NOT SET");
console.log("🟨 process.env Keys:", Object.keys(process.env).filter((key) => key.includes("STRAPI")));
console.log("📍 Umgebung:             ", process.env.NODE_ENV);
console.log("📁 Aktives Working Dir:  ", process.cwd());
console.log("==============================\n");

// ✅ Richtig für serverseitigen Code (z. B. in /api oder route.ts)
const STRAPI_URL = process.env.STRAPI_URL || "https://strapi-elearning-8rff.onrender.com";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "DEIN_BACKUP_TOKEN_HIER";

// 🛑 Abbruch mit klarer Fehlermeldung, falls Werte fehlen
if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error("❌ ENV-VARIABLEN FEHLEN:");
  console.error("   STRAPI_URL: ", STRAPI_URL);
  console.error("   STRAPI_TOKEN: ", STRAPI_TOKEN);
  throw new Error("❌ STRAPI_URL oder STRAPI_API_TOKEN ist NICHT gesetzt – Abbruch!");
}

// 🎯 HILFSFUNKTIONEN FÜR LOGOS UND QUIZSETS
async function loadLogos() {
  try {
    const response = await fetch(`${STRAPI_URL}/api/logos?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })
    if (response.ok) {
      const data = await response.json()
      const logos = {}
      data.data?.forEach((logo) => {
        const attrs = logo.attributes || logo
        const slug = attrs.slug || attrs.name?.toLowerCase().replace(/\s+/g, "-")
        logos[slug] = {
          id: logo.id,
          name: attrs.name,
          url: attrs.image?.data?.attributes?.url
            ? `${STRAPI_URL}${attrs.image.data.attributes.url}`
            : attrs.logo?.data?.attributes?.url
              ? `${STRAPI_URL}${attrs.logo.data.attributes.url}`
              : `/images/${slug}-logo.png`,
        }
      })
      return logos
    }
  } catch (error) {
    console.warn("⚠️ Failed to load logos:", error.message)
  }
  return {}
}

async function loadQuizsets() {
  try {
    console.log("🧠 Loading quizsets from:", `${STRAPI_URL}/api/quizsets?populate=*`)

    const response = await fetch(`${STRAPI_URL}/api/quizsets?populate=*`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log("🧠 Raw Quizsets API Response:", JSON.stringify(data, null, 2))

      // 🎯 GRUPPIERE QUIZSETS NACH MODUL UND SORTIERE NACH ORDER
      const quizsetsByModule = {}

      data.data?.forEach((quizset) => {
        const attrs = quizset.attributes || quizset
        console.log(`\n🧠 Processing Quizset ${quizset.id}:`)
        console.log(`❓ Frage: "${attrs.frage}"`)
        console.log(`📋 Auswahl count: ${attrs.auswahl?.length || 0}`)
        console.log(`📊 Order: ${attrs.order || 0}`)

        // Extrahiere Modul-Referenz
        let moduleId = null
        if (attrs.module?.data?.id) {
          moduleId = attrs.module.data.id
        } else if (attrs.module?.id) {
          moduleId = attrs.module.id
        } else if (attrs.modules?.data && attrs.modules.data.length > 0) {
          moduleId = attrs.modules.data[0].id
        }

        console.log(`🔗 Module ID: ${moduleId}`)

        if (moduleId && attrs.frage && attrs.auswahl && Array.isArray(attrs.auswahl)) {
          // Verarbeite Antwortoptionen
          let correctAnswerIndex = 0
          const options = attrs.auswahl.map((option, index) => {
            const optionText = option.antwort || option.text || option.option || `Option ${index + 1}`

            // Prüfe verschiedene Wege für korrekte Antwort
            if (option.isCorrect === true || option.correct === true || option.richtig === true) {
              correctAnswerIndex = index
              console.log(`✅ Correct answer found at index ${index}: "${optionText}"`)
            }

            console.log(`   Option ${index}: "${optionText}" ${option.isCorrect ? "(CORRECT)" : ""}`)
            return optionText
          })

          // Erstelle Frage-Objekt
          const question = {
            id: quizset.id,
            question: attrs.frage,
            options: options,
            correctAnswer: correctAnswerIndex,
            explanation: attrs.explanation || attrs.erklaerung || "",
            order: attrs.order || 0,
          }

          // Initialisiere Modul-Array falls nicht vorhanden
          if (!quizsetsByModule[moduleId]) {
            quizsetsByModule[moduleId] = {
              moduleId: moduleId,
              questions: [],
              passingScore: 70,
              timeLimit: null,
              difficulty: "medium",
            }
          }

          // Füge Frage hinzu
          quizsetsByModule[moduleId].questions.push(question)

          // Update Quiz-Metadaten (verwende Werte der ersten Frage)
          if (quizsetsByModule[moduleId].questions.length === 1) {
            quizsetsByModule[moduleId].passingScore = attrs.passingScore || attrs.mindestpunktzahl || 70
            quizsetsByModule[moduleId].timeLimit = attrs.timeLimit || attrs.zeitlimit
            quizsetsByModule[moduleId].difficulty = attrs.difficulty || attrs.schwierigkeit || "medium"
          }

          console.log(`✅ Question added to module ${moduleId}:`)
          console.log(`   Question: "${attrs.frage}"`)
          console.log(`   Options: [${options.join(", ")}]`)
          console.log(`   Correct: "${options[correctAnswerIndex]}" (index: ${correctAnswerIndex})`)
          console.log(`   Order: ${attrs.order || 0}`)
        } else {
          console.log(`⚠️ Skipping quizset ${quizset.id} - missing data:`)
          console.log(`   Module ID: ${moduleId}`)
          console.log(`   Has Frage: ${!!attrs.frage}`)
          console.log(`   Has Auswahl: ${!!attrs.auswahl}`)
          console.log(`   Auswahl is Array: ${Array.isArray(attrs.auswahl)}`)
        }
      })

      // 🎯 SORTIERE FRAGEN NACH ORDER INNERHALB JEDES MODULS
      Object.keys(quizsetsByModule).forEach((moduleId) => {
        const moduleQuiz = quizsetsByModule[moduleId]
        moduleQuiz.questions.sort((a, b) => a.order - b.order)

        console.log(`\n📚 Module ${moduleId} Quiz Summary:`)
        console.log(`   📊 Total Questions: ${moduleQuiz.questions.length}`)
        console.log(`   🎯 Passing Score: ${moduleQuiz.passingScore}%`)
        console.log(`   ⏱️ Time Limit: ${moduleQuiz.timeLimit || "None"}`)
        console.log(`   📋 Questions (sorted by order):`)

        moduleQuiz.questions.forEach((q, index) => {
          console.log(`      ${index + 1}. "${q.question}" (Order: ${q.order})`)
          console.log(`         Correct: "${q.options[q.correctAnswer]}"`)
        })
      })

      console.log(`\n🧠 Final Quizsets Summary:`)
      console.log(`   📚 Modules with quizzes: ${Object.keys(quizsetsByModule).length}`)
      Object.keys(quizsetsByModule).forEach((moduleId) => {
        const quiz = quizsetsByModule[moduleId]
        console.log(`   Module ${moduleId}: ${quiz.questions.length} questions`)
      })

      return quizsetsByModule
    }
  } catch (error) {
    console.error("⚠️ Failed to load quizsets:", error)
  }
  return {}
}

export async function GET(request: NextRequest, context: { params: { courseId: string } }) {
  const { courseId } = context.params // ✅ Jetzt korrekt
  console.log(`\n🔍 === COURSE API DEBUG INFO ===`)
  console.log(`🎯 Course ID from URL: ${courseId}`)
  console.log("🌐 Strapi URL:", STRAPI_URL)
  console.log("🔑 API Token present:", !!STRAPI_TOKEN)

  try {
    // 🎯 DIREKTE COURSES API ABFRAGE
    const coursesUrl = `${STRAPI_URL}/api/courses?populate=*`
    console.log("📡 Making request to Courses API:", coursesUrl)

    const response = await fetch(coursesUrl, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Response status:", response.status)
    console.log("📡 Response OK:", response.ok)
    
    const raw = await response.text()

    let data: any
    try {
      data = JSON.parse(raw)
    } catch (err) {
      console.error("❌ Could not parse JSON from Strapi:", raw)
      return NextResponse.json({ error: "Strapi returned invalid JSON" }, { status: 500 })
    }

    if (!response.ok) {
      console.error("💥 Courses API error:", response.status, response.statusText, raw)
      return NextResponse.json({ error: "Failed to fetch courses from Strapi", details: raw }, { status: response.status })
    }

    console.log("📦 Raw Courses API Response received")
    console.log("📦 Courses count:", data.data?.length || 0)

    // 🔍 SUCHE NACH DEM COURSE MIT DER GEGEBENEN ID
    let foundCourse = null

    if (data.data && Array.isArray(data.data)) {
      foundCourse = data.data.find((course) => course.id == courseId)

      if (foundCourse) {
        console.log(`✅ Found matching course: ${foundCourse.attributes?.title || foundCourse.title}`)
      }
    }

    if (!foundCourse) {
      console.log("❌ Course not found in courses API")
      return NextResponse.json({ error: `Course with ID "${courseId}" not found` }, { status: 404 })
    }

    // 🎯 HOLE ZUGEHÖRIGE MODULE
    console.log("📡 Loading modules for course...")
    const modulesUrl = `${STRAPI_URL}/api/modules?populate=*`
    const modulesResponse = await fetch(modulesUrl, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
    })

    let courseModules = []
    if (modulesResponse.ok) {
      const modulesData = await modulesResponse.json()
      console.log("📚 Total modules available:", modulesData.data?.length || 0)

      // Filter Module für diesen Kurs
      if (modulesData.data && Array.isArray(modulesData.data)) {
        courseModules = modulesData.data.filter((module) => {
          // Prüfe verschiedene mögliche Referenz-Strukturen
          const moduleAttributes = module.attributes || module
          const coursRef = moduleAttributes.course || moduleAttributes.courses

          if (coursRef?.data) {
            // Strapi v4 Format mit data wrapper
            return (
              coursRef.data.id == courseId ||
              (Array.isArray(coursRef.data) && coursRef.data.some((c) => c.id == courseId))
            )
          } else if (coursRef) {
            // Direkter Verweis
            return coursRef.id == courseId || coursRef == courseId
          }
          return false
        })
      }

      console.log(`📚 Modules found for course ${courseId}:`, courseModules.length)
    } else {
      console.warn("⚠️ Failed to load modules, using empty array")
    }

    // 🎯 LADE LOGOS UND QUIZSETS
    console.log("📡 Loading logos and quizsets...")
    const [logos, quizsetsByModule] = await Promise.all([loadLogos(), loadQuizsets()])

    console.log("📷 Logos loaded:", Object.keys(logos).length)
    console.log("🧠 Quizsets loaded for modules:", Object.keys(quizsetsByModule).length)

    // 🎯 COURSE DATA TRANSFORMATION
    const courseAttributes = foundCourse.attributes || foundCourse

    const transformedModules = courseModules
      .sort((a, b) => {
        const aOrder = (a.attributes || a).order || 0
        const bOrder = (b.attributes || b).order || 0
        return aOrder - bOrder
      })
      .map((module, index) => {
        const moduleAttributes = module.attributes || module
        console.log(`\n🔄 Processing module ${index + 1}: ${moduleAttributes.title} (ID: ${module.id})`)

        // 🧠 Quiz aus Quizsets API extrahieren basierend auf Modul-ID
        let quiz = {
          questions: [
            {
              id: 1,
              question: `Was haben Sie in "${moduleAttributes.title}" gelernt?`,
              options: ["Grundlagen", "Erweiterte Konzepte", "Praktische Anwendung", "Alle Antworten"],
              correctAnswer: 3,
            },
          ],
          passingScore: 70,
        }

        // Suche Quiz für dieses Modul
        if (quizsetsByModule[module.id]) {
          const moduleQuiz = quizsetsByModule[module.id]
          quiz = {
            questions: moduleQuiz.questions.map((q, qIndex) => ({
              id: qIndex + 1, // Sequenzielle IDs für Frontend
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
            passingScore: moduleQuiz.passingScore,
            timeLimit: moduleQuiz.timeLimit,
            difficulty: moduleQuiz.difficulty,
          }

          console.log(`✅ Found ${quiz.questions.length} questions for module ${module.id}:`)
          quiz.questions.forEach((q, qIndex) => {
            console.log(`   ${qIndex + 1}. "${q.question}"`)
            console.log(`      Options: [${q.options.join(", ")}]`)
            console.log(`      Correct: "${q.options[q.correctAnswer]}" (index: ${q.correctAnswer})`)
          })
        } else {
          console.log(`⚠️ No quiz found for module ${module.id}, using fallback`)
          console.log(`📋 Available quiz modules: [${Object.keys(quizsetsByModule).join(", ")}]`)
        }

        return {
          id: module.id,
          title: moduleAttributes.title,
          description: moduleAttributes.description || `Lernen Sie mehr über ${moduleAttributes.title}`,
          duration: moduleAttributes.duration || "15 Min",
          type: "video" as const,
          completed: moduleAttributes.completed || false,
          videoUrl:
            moduleAttributes.videoUrl || moduleAttributes.video_url || `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
          videoTitle: moduleAttributes.videoTitle || moduleAttributes.video_title || moduleAttributes.title,
          quiz,
        }
      })

    // 🎯 LOGO HANDLING - KORREKTE EXTRAKTION AUS STRAPI
    let courseLogo = null

    console.log("🖼️ === LOGO EXTRACTION ===")

    // Extrahiere Logo aus Strapi Course Response
    const logoAttributes = courseAttributes.logo
    console.log("Logo Data Structure:", JSON.stringify(logoAttributes, null, 2))

    if (logoAttributes) {
      console.log("Logo Attributes:", JSON.stringify(logoAttributes, null, 2))

      // Priorisiere thumbnail URL aus formats
      if (logoAttributes?.formats?.thumbnail?.url) {
        courseLogo = logoAttributes.formats.thumbnail.url.startsWith("http")
          ? logoAttributes.formats.thumbnail.url
          : `${STRAPI_URL}${logoAttributes.formats.thumbnail.url}`
        console.log(`📷 Using thumbnail URL: ${courseLogo}`)
      }
      // Fallback auf normale URL
      else if (logoAttributes?.url) {
        courseLogo = logoAttributes.url.startsWith("http") ? logoAttributes.url : `${STRAPI_URL}${logoAttributes.url}`
        console.log(`📷 Using direct URL: ${courseLogo}`)
      }
    }

    // Fallback auf Logos API wenn kein Logo in Course gefunden
    if (!courseLogo) {
      const courseSlug = courseAttributes.title
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
      if (logos[courseSlug]) {
        courseLogo = logos[courseSlug].url
        console.log(`📷 Using logo from Logos API: ${courseLogo}`)
      }
    }

    // Letzter Fallback nur wenn wirklich nichts gefunden wurde
    if (!courseLogo) {
      courseLogo = `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(courseAttributes.title || "Kurs")}`
      console.log(`⚠️ Using placeholder as last resort: ${courseLogo}`)
    }

    console.log(`📷 Final Logo URL: ${courseLogo}`)
    console.log("===============================")

    // 🎯 FINAL COURSE OBJECT
    const course = {
      id: foundCourse.id,
      title: courseAttributes.title,
      description: courseAttributes.description || `Umfassender Kurs zu ${courseAttributes.title}`,
      logo: courseLogo,
      gradient: courseAttributes.gradient || "from-slate-500 to-slate-600",
      modules: transformedModules,
    }

    console.log(`\n🎉 Course successfully loaded via Courses API:`)
    console.log(`   📝 Title: ${course.title}`)
    console.log(`   🔢 ID: ${course.id}`)
    console.log(`   🖼️ Logo: ${course.logo}`)
    console.log(`   📚 Modules: ${course.modules.length}`)

    // Log Quiz-Status für jedes Modul
    course.modules.forEach((module, index) => {
      const hasRealQuiz = quizsetsByModule[module.id]
      const questionCount = hasRealQuiz ? hasRealQuiz.questions.length : 1
      console.log(
        `   Module ${index + 1}: ${module.title} - Quiz: ${hasRealQuiz ? `✅ ${questionCount} questions` : "⚠️ Fallback"}`,
      )
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("💥 Course API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch course from Courses API",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
