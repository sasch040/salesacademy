// Strapi API Client
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337"

export interface StrapiModule {
  id: number
  attributes: {
    title: string
    description: string
    duration: string
    videoTitle: string
    videoUrl: string
    completed: boolean
    order: number
    quiz: {
      questions: Array<{
        question: string
        options: string[]
        correctAnswer: number
      }>
      passingScore: number
    }
    createdAt: string
    updatedAt: string
  }
}

export interface StrapiCourse {
  id: number
  attributes: {
    title: string
    description: string
    slug: string
    logo: string
    gradient: string
    modules: {
      data: StrapiModule[]
    }
    createdAt: string
    updatedAt: string
  }
}

export interface StrapiProduct {
  id: number
  attributes: {
    title: string
    description: string
    logo: {
      data: {
        attributes: {
          url: string
        }
      }
    }
    course: {
      // ← Singular statt courses
      data: StrapiCourse
    }
  }
}

// 🎯 AKTUALISIERTE STRAPI API FUNCTIONS (ohne Slugs)
export async function getCourse(courseId: number): Promise<StrapiCourse | null> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/courses/${courseId}?populate[modules][populate]=*`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    })

    const data = await response.json()
    return data.data || null
  } catch (error) {
    console.error("Error fetching course:", error)
    return null
  }
}

export async function getAllCourses(): Promise<StrapiCourse[]> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/courses?populate[modules][populate]=*`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    })

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

export async function getAllProducts(): Promise<StrapiProduct[]> {
  try {
    const response = await fetch(`${STRAPI_URL}/api/products?populate[logo]=*&populate[course]=*`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
    })

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// 🎯 TRANSFORM FUNCTIONS (ohne Slugs)
export function transformStrapiCourse(strapiCourse: StrapiCourse) {
  return {
    id: strapiCourse.id, // ← ID statt Slug
    title: strapiCourse.attributes.title,
    description: strapiCourse.attributes.description,
    logo: strapiCourse.attributes.logo,
    gradient: strapiCourse.attributes.gradient,
    modules: strapiCourse.attributes.modules.data
      .sort((a, b) => a.attributes.order - b.attributes.order)
      .map((module) => ({
        id: module.id, // ← ID statt Slug
        title: module.attributes.title,
        description: module.attributes.description,
        duration: module.attributes.duration,
        type: "video" as const,
        completed: module.attributes.completed,
        videoUrl: module.attributes.videoUrl,
        videoTitle: module.attributes.videoTitle,
        quiz: module.attributes.quiz,
      })),
  }
}
