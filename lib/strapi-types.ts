// TypeScript Interfaces basierend auf Ihrer Strapi Struktur

export interface StrapiProduct {
  id: number
  attributes: {
    name: string
    slug: string
    description: string
    gradient: string
    logo: {
      data: {
        attributes: {
          url: string
          name: string
          size: number
        }
      }
    }
    courses: {
      data: StrapiCourse[]
    }
    sales_materials: {
      data: StrapiSalesMaterial[]
    }
  }
}

export interface StrapiCourse {
  id: number
  attributes: {
    title: string
    description: string
    slug: string
    gradient: string
    product: {
      data: StrapiProduct
    }
    modules: {
      data: StrapiModule[]
    }
  }
}

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
    course: {
      data: StrapiCourse
    }
  }
}

export interface StrapiAuthorizedUser {
  id: number
  attributes: {
    email: string
    isActive: boolean
    role: "admin" | "teacher" | "student"
    lastLogin: string
  }
}

export interface StrapiSalesMaterial {
  id: number
  attributes: {
    title: string
    description: string
    type: "pdf" | "presentation" | "video" | "document"
    category: "brochure" | "presentation" | "manual" | "cheatsheet"
    file: {
      data: {
        attributes: {
          url: string
          name: string
          size: number
          ext: string
        }
      }
    }
    product: {
      data: StrapiProduct
    }
  }
}
