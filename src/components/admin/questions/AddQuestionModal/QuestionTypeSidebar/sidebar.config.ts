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
];