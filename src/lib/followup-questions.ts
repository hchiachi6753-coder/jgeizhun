// 追問題庫 - 5 大類 × 各 5 題

export interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  questions: string[];
}

export const FOLLOW_UP_CATEGORIES: QuestionCategory[] = [
  {
    id: 'career',
    name: '事業工作',
    icon: '💼',
    questions: [
      '我適合現在換工作嗎？',
      '什麼時候是轉職的好時機？',
      '我適合創業嗎？',
      '如何讓求職更順利？',
      '我的事業發展方向是什麼？',
    ],
  },
  {
    id: 'love',
    name: '感情婚姻',
    icon: '❤️',
    questions: [
      '今年有機會遇到正緣嗎？',
      '我跟現任適合結婚嗎？',
      '感情會往什麼方向發展？',
      '跟前任有復合的可能嗎？',
      '我的桃花運如何？',
    ],
  },
  {
    id: 'wealth',
    name: '財運投資',
    icon: '💰',
    questions: [
      '今年財運如何？',
      '適合投資嗎？',
      '創業資金會順利嗎？',
      '如何提升財運？',
      '有偏財運嗎？',
    ],
  },
  {
    id: 'health',
    name: '身體健康',
    icon: '🩺',
    questions: [
      '要注意哪些身體部位？',
      '今年健康運勢如何？',
      '如何養生調理？',
      '適合什麼運動？',
      '壓力管理有什麼建議？',
    ],
  },
  {
    id: 'study',
    name: '學業考試',
    icon: '📚',
    questions: [
      '考運如何？',
      '適合讀什麼科系？',
      '文昌位在哪裡？',
      '如何提升學習效率？',
      '升學方向有什麼建議？',
    ],
  },
];
