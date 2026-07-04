import { apiClient } from "../api/client";

export type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor_name: string;
  price: number;
  duration_hours: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  thumbnail_url: string | null;
  category_tag: string;
  lessons_count: number;
  avg_rating: number;
};

export type CourseDetail = CourseSummary & {
  is_published: boolean;
};

export const courseService = {
  listCourses: async (
    search = "",
    difficulty?: string,
    categoryTag?: string,
    sort = "latest"
  ) => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (difficulty) params.difficulty = difficulty;
    if (categoryTag) params.category_tag = categoryTag;
    if (sort) params.sort = sort;
    const { data } = await apiClient.get("/courses", { params });
    return data as CourseSummary[];
  },

  getCourse: async (courseId: string) => {
    const { data } = await apiClient.get(`/courses/${courseId}`);
    return data as CourseDetail;
  },
};
