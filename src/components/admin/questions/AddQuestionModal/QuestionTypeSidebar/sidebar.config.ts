// components/sidebar.config.ts

import type { SidebarItem } from "../QuestionEditor/editor.type";


export const SIDEBAR_CONFIG: SidebarItem[] = [
  {
    id: "toeic",
    label: "TOEIC",
    icon: "fa-solid fa-headphones",
    children: [
      {
        id: "toeic-listening",
        label: "Listening",
        icon: "fa-solid fa-volume-high",
        children: [
          {
            id: "toeic-part-1",
            label: "Part 1 - Photos",
            icon: "fa-solid fa-image",
            editorKey: "TOEIC_PART_1",
            type: "single",
          },
          {
            id: "toeic-part-2",
            label: "Part 2 - Question-Response",
            icon: "fa-solid fa-comment",
            editorKey: "TOEIC_PART_2",
            type: "single",
          },
          {
            id: "toeic-part-3",
            label: "Part 3 - Conversations",
            icon: "fa-solid fa-comments",
            editorKey: "TOEIC_PART_3",
            type: "group",
          },
          {
            id: "toeic-part-4",
            label: "Part 4 - Talks",
            icon: "fa-solid fa-podcast",
            editorKey: "TOEIC_PART_4",
            type: "group",
          },
        ],
      },
      {
        id: "toeic-reading",
        label: "Reading",
        icon: "fa-solid fa-book-open",
        children: [
          {
            id: "toeic-part-5",
            label: "Part 5 - Incomplete Sentences",
            icon: "fa-solid fa-spell-check",
            editorKey: "TOEIC_PART_5",
            type: "single",
          },
          {
            id: "toeic-part-6",
            label: "Part 6 - Text Completion",
            icon: "fa-solid fa-file-lines",
            editorKey: "TOEIC_PART_6",
            type: "group",
          },
          {
            id: "toeic-part-7",
            label: "Part 7 - Reading Comprehension",
            icon: "fa-solid fa-newspaper",
            editorKey: "TOEIC_PART_7",
            type: "group",
          },
        ],
      },
    ],
  },

  // 🔥 IELTS thêm vào đây
  {
    id: "ielts",
    label: "IELTS",
    icon: "fa-solid fa-globe",
    children: [
      // 🎧 LISTENING
      {
        id: "ielts-listening",
        label: "Listening",
        icon: "fa-solid fa-headphones",
        children: [
          {
            id: "ielts-listening-part-1",
            label: "Part 1 - Form Completion",
            icon: "fa-solid fa-file-lines",
            editorKey: "IELTS_LISTENING_PART_1",
            type: "group",
          },
          {
            id: "ielts-listening-part-2",
            label: "Part 2 - Monologue",
            icon: "fa-solid fa-person-chalkboard",
            editorKey: "IELTS_LISTENING_PART_2",
            type: "group",
          },
          {
            id: "ielts-listening-part-3",
            label: "Part 3 - Conversation",
            icon: "fa-solid fa-comments",
            editorKey: "IELTS_LISTENING_PART_3",
            type: "group",
          },
          {
            id: "ielts-listening-part-4",
            label: "Part 4 - Lecture",
            icon: "fa-solid fa-graduation-cap",
            editorKey: "IELTS_LISTENING_PART_4",
            type: "group",
          },
        ],
      },

      // 📖 READING
      {
        id: "ielts-reading",
        label: "Reading",
        icon: "fa-solid fa-book-open",
        children: [
          {
            id: "ielts-reading-passage-1",
            label: "Passage 1",
            icon: "fa-solid fa-file-lines",
            editorKey: "IELTS_READING_PASSAGE_1",
            type: "group",
          },
          {
            id: "ielts-reading-passage-2",
            label: "Passage 2",
            icon: "fa-solid fa-file-lines",
            editorKey: "IELTS_READING_PASSAGE_2",
            type: "group",
          },
          {
            id: "ielts-reading-passage-3",
            label: "Passage 3",
            icon: "fa-solid fa-file-lines",
            editorKey: "IELTS_READING_PASSAGE_3",
            type: "group",
          },
        ],
      },
    ],
  },
];