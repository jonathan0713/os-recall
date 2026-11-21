window.OS_DATA = {
  "title": "OS Recall",
  "version": 1,
  "categories": [
    {
      "id": "scheduling",
      "number": "01",
      "name": "行程與排程",
      "description": "CPU 時間如何分配"
    },
    {
      "id": "memory",
      "number": "02",
      "name": "虛擬記憶體",
      "description": "位址空間與頁面"
    },
    {
      "id": "concurrency",
      "number": "03",
      "name": "並行與同步",
      "description": "共享狀態與鎖"
    }
  ],
  "cards": [
    {
      "id": "DEMO-01",
      "category": "scheduling",
      "question": "搶先式排程為何能改善反應時間？",
      "question_en": "Why can preemptive scheduling improve responsiveness?",
      "question_zh": "搶先式排程為何能改善反應時間？",
      "answer": "排程器可以中斷正在執行的工作，讓需要即時回應的工作先取得 CPU 時間。",
      "answer_en": "The scheduler can interrupt a running task to give CPU time to one that needs a prompt response.",
      "answer_zh": "排程器可以中斷正在執行的工作，讓需要即時回應的工作先取得 CPU 時間。",
      "detail": "",
      "cue": "",
      "exam": "",
      "basis": "Demo card",
      "source": {
        "label": "原創示範卡",
        "pages": []
      },
      "distractors": [
        "Every job is guaranteed to finish earlier.",
        "Running tasks are never interrupted."
      ],
      "distractors_en": [
        "Every job is guaranteed to finish earlier.",
        "Running tasks are never interrupted."
      ]
    },
    {
      "id": "DEMO-02",
      "category": "scheduling",
      "question": "輪詢排程的時間片用完時會發生什麼？",
      "question_en": "What happens when a round-robin time slice ends?",
      "question_zh": "輪詢排程的時間片用完時會發生什麼？",
      "answer": "仍可執行的工作回到就緒佇列，CPU 可以交給下一個工作。",
      "answer_en": "A task that remains runnable goes back to the ready queue so another task can run.",
      "answer_zh": "仍可執行的工作回到就緒佇列，CPU 可以交給下一個工作。",
      "detail": "",
      "cue": "",
      "exam": "",
      "basis": "Demo card",
      "source": {
        "label": "原創示範卡",
        "pages": []
      },
      "distractors": [
        "The task loses all its memory.",
        "The task is marked complete."
      ],
      "distractors_en": [
        "The task loses all its memory.",
        "The task is marked complete."
      ]
    },
    {
      "id": "DEMO-03",
      "category": "memory",
      "question": "兩個行程為何可以使用相同的虛擬位址？",
      "question_en": "Why can two processes use the same virtual address?",
      "question_zh": "兩個行程為何可以使用相同的虛擬位址？",
      "answer": "每個行程有自己的位址對應，所以相同的虛擬位址可以指向不同實體頁。",
      "answer_en": "Each process has its own address mappings, so the same address can refer to different physical pages.",
      "answer_zh": "每個行程有自己的位址對應，所以相同的虛擬位址可以指向不同實體頁。",
      "detail": "",
      "cue": "",
      "exam": "",
      "basis": "Demo card",
      "source": {
        "label": "原創示範卡",
        "pages": []
      },
      "distractors": [
        "All virtual addresses are physical addresses.",
        "The processes must share all their memory."
      ],
      "distractors_en": [
        "All virtual addresses are physical addresses.",
        "The processes must share all their memory."
      ]
    },
    {
      "id": "DEMO-04",
      "category": "memory",
      "question": "寫入時複製會在什麼時候建立私有頁面？",
      "question_en": "When does copy-on-write make a private copy of a page?",
      "question_zh": "寫入時複製會在什麼時候建立私有頁面？",
      "answer": "當行程要寫入共享頁面時，系統才建立私有副本。",
      "answer_en": "A private copy is made when a process tries to write to the shared page.",
      "answer_zh": "當行程要寫入共享頁面時，系統才建立私有副本。",
      "detail": "",
      "cue": "",
      "exam": "",
      "basis": "Demo card",
      "source": {
        "label": "原創示範卡",
        "pages": []
      },
      "distractors": [
        "Whenever a process reads the page.",
        "As soon as the page is first mapped."
      ],
      "distractors_en": [
        "Whenever a process reads the page.",
        "As soon as the page is first mapped."
      ]
    },
    {
      "id": "DEMO-05",
      "category": "concurrency",
      "question": "互斥鎖如何保護共享計數器？",
      "question_en": "How can a mutex protect a shared counter?",
      "question_zh": "互斥鎖如何保護共享計數器？",
      "answer": "它讓一個執行緒先完成讀取、更新和寫回，再讓另一個執行緒進入同一區段。",
      "answer_en": "It lets one thread complete the read, update, and write before another thread enters the same section.",
      "answer_zh": "它讓一個執行緒先完成讀取、更新和寫回，再讓另一個執行緒進入同一區段。",
      "detail": "",
      "cue": "",
      "exam": "",
      "basis": "Demo card",
      "source": {
        "label": "原創示範卡",
        "pages": []
      },
      "distractors": [
        "It ensures the counter is permanently read-only.",
        "It gives each thread the same CPU time."
      ],
      "distractors_en": [
        "It ensures the counter is permanently read-only.",
        "It gives each thread the same CPU time."
      ]
    },
    {
      "id": "DEMO-06",
      "category": "concurrency",
      "question": "相互等待鎖什麼時候會造成死結？",
      "question_en": "When can a circular lock dependency cause deadlock?",
      "question_zh": "相互等待鎖什麼時候會造成死結？",
      "answer": "每個工作都持有下一個工作需要的鎖，大家都無法繼續執行並釋放鎖。",
      "answer_en": "Each task holds a lock that the next task needs, and none can move forward to release its lock.",
      "answer_zh": "每個工作都持有下一個工作需要的鎖，大家都無法繼續執行並釋放鎖。",
      "detail": "",
      "cue": "",
      "exam": "",
      "basis": "Demo card",
      "source": {
        "label": "原創示範卡",
        "pages": []
      },
      "distractors": [
        "Every task requests the locks in one shared order.",
        "All tasks immediately release their locks."
      ],
      "distractors_en": [
        "Every task requests the locks in one shared order.",
        "All tasks immediately release their locks."
      ]
    }
  ]
};
