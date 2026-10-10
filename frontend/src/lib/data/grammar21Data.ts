export interface GrammarExercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
}

export interface SubExercise {
  id: string;
  order: number;
  title: string;
  type: string;
  description: string;
  questions: GrammarExercise[];
}

export interface GrammarTopic21 {
  id: string;
  number: number;
  title: string;
  enTitle: string;
  slug: string;
  summary: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  difficulty: 'A1-A2' | 'B1-B2' | 'C1';
  estimatedMinutes: number;
  completedPercent: number;
  
  // 1. Lí thuyết
  theory: {
    overview: string;
    diagramRoot?: string;
    formulas: {
      type: string;
      pattern: string;
      note: string;
    }[];
    usages: {
      title: string;
      detail?: string;
      signals?: string[];
    }[];
    notes: string[];
    pitfalls: {
      wrong: string;
      correct: string;
      explanation: string;
    }[];
  };

  // 2. Ví dụ
  examples: {
    id: string;
    en: string;
    vi: string;
    context: string;
    breakdown: {
      subject: string;
      verb: string;
      objectAndOthers: string;
    };
  }[];

  // 3. Bài tập (Gồm nhiều bài nhỏ)
  exercises: GrammarExercise[];
  subExercises?: SubExercise[];

  // 4. Thi online
  exam: {
    durationMinutes: number;
    totalQuestions: number;
    passScore: number;
    questions: GrammarExercise[];
  };
}

export const GRAMMAR_21_TOPICS: GrammarTopic21[] = [
  {
    id: 't-1',
    number: 1,
    title: 'Hiện Tại Đơn',
    enTitle: 'Present Simple',
    slug: 'present-simple',
    summary: 'Diễn tả thói quen, chân lý khoa học, lịch trình cố định và các sự thật hiển nhiên.',
    level: 'Beginner',
    difficulty: 'A1-A2',
    estimatedMinutes: 20,
    completedPercent: 85,
    theory: {
      overview: 'Thì Hiện tại đơn là nền móng ngữ pháp cơ bản nhất trong tiếng Anh, dùng để diễn tả các hành động lặp đi lặp lại mang tính quy luật hoặc sự thật bất biến.',
      diagramRoot: 'Hiện Tại Đơn (Present Simple)',
      formulas: [
        {
          type: 'Khẳng định (+)',
          pattern: 'S + V(s/es) + O',
          note: 'Với chủ ngữ He / She / It / Danh từ số ít: động từ thêm -s hoặc -es. Với I / You / We / They: giữ nguyên dạng V nguyên mẫu.',
        },
        {
          type: 'Phủ định (-)',
          pattern: 'S + do/does + not + V(nguyên mẫu)',
          note: 'He/She/It dùng does not (doesn\'t). I/You/We/They dùng do not (don\'t). Động từ chính đưa về nguyên mẫu.',
        },
        {
          type: 'Nghi vấn (?)',
          pattern: 'Do/Does + S + V(nguyên mẫu)?',
          note: 'Đảo trợ động từ Do/Does lên đầu câu. Trả lời: Yes, S + do/does hoặc No, S + don\'t/doesn\'t.',
        },
      ],
      usages: [
        {
          title: 'Thói quen và hành động lặp lại hàng ngày',
          detail: 'Hành động diễn ra đều đặn theo lịch trình sống.',
          signals: ['always', 'usually', 'often', 'sometimes', 'rarely', 'never', 'every day'],
        },
        {
          title: 'Chân lý khoa học & Sự thật hiển nhiên',
          detail: 'Quy luật tự nhiên, hiện tượng vật lý vĩnh viễn không thay đổi theo thời gian.',
          signals: ['The sun rises in the east', 'Water boils at 100°C'],
        },
        {
          title: 'Lịch trình tàu xe, máy bay cố định',
          detail: 'Sự kiện trong tương lai nhưng tuân theo thời gian biểu công cộng đã ban hành.',
          signals: ['The flight departs at 07:00 AM tomorrow'],
        },
      ],
      notes: [
        'Quy tắc thêm -es: Động từ tận cùng bằng o, s, ch, x, sh, z (watches, washes, goes, fixes).',
        'Phụ âm + y: đổi y thành -ies (study -> studies). Nguyên âm + y: giữ nguyên thêm -s (play -> plays).',
      ],
      pitfalls: [
        {
          wrong: 'He work in a software company.',
          correct: 'He works in a software company.',
          explanation: 'Chủ ngữ ngôi thứ 3 số ít "He" bắt buộc động từ phải thêm "s".',
        },
        {
          wrong: 'She doesn\'t likes coffee.',
          correct: 'She doesn\'t like coffee.',
          explanation: 'Đã có trợ động từ "doesn\'t" thì động từ chính "like" phải về dạng nguyên mẫu.',
        },
      ],
    },
    examples: [
      {
        id: 'ex-1-1',
        en: 'The Earth revolves around the Sun every 365 days.',
        vi: 'Trái Đất quay quanh Mặt Trời mỗi 365 ngày.',
        context: 'Chân lý khoa học bất biến',
        breakdown: { subject: 'The Earth', verb: 'revolves', objectAndOthers: 'around the Sun' },
      },
      {
        id: 'ex-1-2',
        en: 'She reads two chapters of an English book before going to sleep.',
        vi: 'Cô ấy đọc hai chương sách tiếng Anh trước khi đi ngủ.',
        context: 'Thói quen lặp đi lặp lại hàng ngày',
        breakdown: { subject: 'She', verb: 'reads', objectAndOthers: 'two chapters of an English book' },
      },
      {
        id: 'ex-1-3',
        en: 'My express train departs at 08:30 tomorrow morning.',
        vi: 'Chuyến tàu tốc hành của tôi khởi hành lúc 8:30 sáng mai.',
        context: 'Lịch trình tàu xe đã niêm yết',
        breakdown: { subject: 'My express train', verb: 'departs', objectAndOthers: 'at 08:30 tomorrow' },
      },
    ],
    exercises: [
      {
        id: 'q-1-1',
        question: 'Water ________ at 100 degrees Celsius under standard atmospheric pressure.',
        options: ['boil', 'boils', 'is boiling', 'boiled'],
        correctAnswer: 1,
        explanation: 'Water là danh từ không đếm được (ngôi thứ 3 số ít), diễn tả chân lý khoa học nên dùng "boils".',
      },
      {
        id: 'q-1-2',
        question: 'He ________ like spicy food, so he always orders soup.',
        options: ["don't", "doesn't", 'isn\'t', 'not'],
        correctAnswer: 1,
        explanation: 'Chủ ngữ "He" dùng trợ động từ phủ định "doesn\'t" cho động từ thường "like".',
      },
      {
        id: 'q-1-3',
        question: 'What time ________ the lecture usually start?',
        options: ['do', 'does', 'is', 'has'],
        correctAnswer: 1,
        explanation: '"The lecture" là danh từ số ít nên dùng trợ động từ "does" trong câu hỏi.',
      },
    ],
    subExercises: [
      {
        id: 'sub-1-1',
        order: 1,
        title: 'Bài 1: Nhận Diện & Trợ Động Từ (Do / Does)',
        type: 'Trắc nghiệm cơ bản',
        description: 'Luyện tập phân biệt trợ động từ Do / Does trong câu phủ định và nghi vấn.',
        questions: [
          {
            id: 'sub-q-1-1',
            question: '________ your parents live in Hanoi or Ho Chi Minh City?',
            options: ['Do', 'Does', 'Are', 'Is'],
            correctAnswer: 0,
            explanation: '"Your parents" là danh từ số nhiều (họ) nên dùng trợ động từ "Do".',
          },
          {
            id: 'sub-q-1-2',
            question: 'She ________ understand French, but she speaks fluent English.',
            options: ["doesn't", "don't", "isn't", 'not'],
            correctAnswer: 0,
            explanation: 'Chủ ngữ ngôi thứ 3 số ít "She" đi với trợ động từ "doesn\'t".',
          },
          {
            id: 'sub-q-1-3',
            question: 'Where ________ he usually buy his morning coffee?',
            options: ['does', 'do', 'is', 'has'],
            correctAnswer: 0,
            explanation: 'Chủ ngữ "he" cần trợ động từ "does" đứng trước chủ ngữ trong câu hỏi Wh-.',
          },
          {
            id: 'sub-q-1-4',
            question: 'We ________ usually have meetings on Friday afternoons.',
            options: ["don't", "doesn't", 'are not', 'no'],
            correctAnswer: 0,
            explanation: 'Chủ ngữ "We" dùng trợ động từ phủ định "don\'t".',
          },
        ],
      },
      {
        id: 'sub-1-2',
        order: 2,
        title: 'Bài 2: Quy Tắc Chia Động Từ (Thêm -s / -es)',
        type: 'Chia động từ',
        description: 'Vận dụng các quy tắc biến đổi đuôi -s, -es, -ies cho chủ ngữ số ít.',
        questions: [
          {
            id: 'sub-q-2-1',
            question: 'He ________ (watch) the financial news every morning before work.',
            options: ['watchs', 'watches', 'watch', 'watching'],
            correctAnswer: 1,
            explanation: 'Động từ tận cùng bằng đuôi "ch" khi đi với chủ ngữ He phải thêm "-es": watches.',
          },
          {
            id: 'sub-q-2-2',
            question: 'My sister ________ (study) biomedical engineering at university.',
            options: ['studys', 'studies', 'study', 'studied'],
            correctAnswer: 1,
            explanation: 'Động từ tận cùng bằng "phụ âm + y" (study) đổi "y" thành "-ies": studies.',
          },
          {
            id: 'sub-q-2-3',
            question: 'The train to Hue ________ (depart) at exactly 07:15 AM.',
            options: ['depart', 'departs', 'departing', 'departes'],
            correctAnswer: 1,
            explanation: '"The train" là danh từ số ít, động từ chỉ cần thêm -s: departs.',
          },
          {
            id: 'sub-q-2-4',
            question: 'He often ________ (fix) his own motorcycle when it breaks down.',
            options: ['fixs', 'fixes', 'fix', 'fixing'],
            correctAnswer: 1,
            explanation: 'Động từ tận cùng bằng "x" thêm "-es": fixes.',
          },
        ],
      },
      {
        id: 'sub-1-3',
        order: 3,
        title: 'Bài 3: Tìm & Sửa Lỗi Sai Ngữ Pháp Thường Gặp',
        type: 'Sửa lỗi sai',
        description: 'Phát hiện các lỗi sai người Việt hay mắc phải trong bài thi chuẩn hóa.',
        questions: [
          {
            id: 'sub-q-3-1',
            question: 'Find the mistake: "She doesn\'t likes (A) waking up (B) early on (C) Sunday mornings (D)."',
            options: ['likes (A)', 'waking up (B)', 'on (C)', 'Sundays (D)'],
            correctAnswer: 0,
            explanation: 'Lỗi ở (A): Sau trợ động từ "doesn\'t", động từ chính phải về nguyên mẫu "like", không thêm -s.',
          },
          {
            id: 'sub-q-3-2',
            question: 'Find the mistake: "One of my best friends live (A) in Sydney (B), Australia (C)."',
            options: ['One of (A)', 'live (B)', 'in Sydney (C)', 'friends (D)'],
            correctAnswer: 1,
            explanation: 'Lỗi ở (B): Chủ ngữ thật là "One" (số ít) nên động từ phải chia "lives".',
          },
          {
            id: 'sub-q-3-3',
            question: 'Find the mistake: "Do he go (A) to the gym (B) every single day (C)?"',
            options: ['Do (A)', 'to (B)', 'every (C)', 'go (D)'],
            correctAnswer: 0,
            explanation: 'Lỗi ở (A): Chủ ngữ "he" bắt buộc dùng trợ động từ "Does", không dùng "Do".',
          },
        ],
      },
      {
        id: 'sub-1-4',
        order: 4,
        title: 'Bài 4: Vận Dụng Trong Giao Tiếp & Đề Thi',
        type: 'Ứng dụng thực tế',
        description: 'Giải quyết các tình huống đối thoại thực tế và câu hỏi chuẩn format TOEIC/IELTS.',
        questions: [
          {
            id: 'sub-q-4-1',
            question: 'Customer: "When ________ the store open on weekends?" - Clerk: "At 8:00 AM, sir."',
            options: ['is', 'does', 'do', 'will'],
            correctAnswer: 1,
            explanation: 'Hỏi về thời gian biểu cố định với động từ thường "open" và chủ ngữ số ít "the store" -> dùng "does".',
          },
          {
            id: 'sub-q-4-2',
            question: 'The flight from Tokyo ________ at Terminal 2 at 18:45 tonight.',
            options: ['arrive', 'arrives', 'is arriving', 'arrived'],
            correctAnswer: 1,
            explanation: 'Lịch trình bay cố định tuân theo Hiện tại đơn -> "arrives".',
          },
          {
            id: 'sub-q-4-3',
            question: 'Water ________ of hydrogen and oxygen molecules.',
            options: ['consist', 'consists', 'is consisting', 'consisted'],
            correctAnswer: 1,
            explanation: 'Định luật hóa học & bản chất bất biến -> "consists".',
          },
        ],
      },
    ],
    exam: {
      durationMinutes: 10,
      totalQuestions: 5,
      passScore: 4,
      questions: [
        {
          id: 'exm-1-1',
          question: 'My grandparents ________ in a quiet village near Da Nang.',
          options: ['lives', 'live', 'is living', 'living'],
          correctAnswer: 1,
          explanation: '"My grandparents" là chủ ngữ số nhiều nên động từ "live" giữ nguyên.',
        },
        {
          id: 'exm-1-2',
          question: 'How often ________ your brother exercise at the gym?',
          options: ['do', 'does', 'is', 'are'],
          correctAnswer: 1,
          explanation: '"Your brother" là ngôi thứ 3 số ít nên dùng "does".',
        },
        {
          id: 'exm-1-3',
          question: 'She usually ________ to work by bus, but today she drives.',
          options: ['go', 'goes', 'going', 'went'],
          correctAnswer: 1,
          explanation: 'Chủ ngữ "She" kèm từ chỉ tần suất "usually" nên chia động từ "goes".',
        },
        {
          id: 'exm-1-4',
          question: 'The library ________ at 9:00 PM every weekday.',
          options: ['close', 'closes', 'is closing', 'closed'],
          correctAnswer: 1,
          explanation: 'Lịch hoạt động cố định của thư viện dùng Hiện tại đơn: "closes".',
        },
        {
          id: 'exm-1-5',
          question: 'Choose the grammatically correct sentence:',
          options: [
            'Does he has a car?',
            'Does he have a car?',
            'Do he has a car?',
            'Is he have a car?',
          ],
          correctAnswer: 1,
          explanation: 'Sau trợ động từ "Does", động từ "have" phải ở dạng nguyên mẫu.',
        },
      ],
    },
  },
  {
    id: 't-2',
    number: 2,
    title: 'Hiện Tại Tiếp Diễn',
    enTitle: 'Present Continuous',
    slug: 'present-continuous',
    summary: 'Hành động đang diễn ra tại thời điểm nói, xu hướng tạm thời và phàn nàn với Always.',
    level: 'Beginner',
    difficulty: 'A1-A2',
    estimatedMinutes: 20,
    completedPercent: 70,
    theory: {
      overview: 'Hiện tại tiếp diễn nhấn mạnh tính chất đang diễn tiến của hành động quanh thời điểm nói hoặc các kế hoạch cá nhân chắc chắn trong tương lai.',
      diagramRoot: 'Hiện Tại Tiếp Diễn (Present Continuous)',
      formulas: [
        {
          type: 'Khẳng định (+)',
          pattern: 'S + am/is/are + V-ing',
          note: 'I am, He/She/It is, You/We/They are.',
        },
        {
          type: 'Phủ định (-)',
          pattern: 'S + am/is/are + not + V-ing',
          note: 'isn\'t, aren\'t, am not.',
        },
        {
          type: 'Nghi vấn (?)',
          pattern: 'Am/Is/Are + S + V-ing?',
          note: 'Đảo to be lên đầu câu hỏi.',
        },
      ],
      usages: [
        {
          title: 'Đang diễn ra ngay lúc nói',
          detail: 'Hành động có thể quan sát thấy được tại khoảnh khắc nói.',
          signals: ['now', 'at the moment', 'right now', 'Look!', 'Listen!'],
        },
        {
          title: 'Tình huống mang tính tạm thời',
          detail: 'Hành động không kéo dài vĩnh viễn (ví dụ: đang ở trọ, đang học khóa học).',
          signals: ['this week', 'these days', 'currently'],
        },
        {
          title: 'Phàn nàn về thói quen xấu với Always',
          detail: 'Thể hiện sự khó chịu, bực mình của người nói.',
          signals: ['He is always forgetting his keys!'],
        },
      ],
      notes: [
        'Không dùng tiếp diễn với các Stative Verbs (động từ chỉ trạng thái, giác quan, sở hữu): know, understand, believe, love, hate, want, belong to.',
      ],
      pitfalls: [
        {
          wrong: 'I am understanding this rule now.',
          correct: 'I understand this rule now.',
          explanation: '"Understand" là động từ nhận thức, không chia ở dạng tiếp diễn.',
        },
      ],
    },
    examples: [
      {
        id: 'ex-2-1',
        en: 'Please be quiet! The baby is sleeping in the next room.',
        vi: 'Xin hãy giữ yên lặng! Em bé đang ngủ ở phòng bên cạnh.',
        context: 'Hành động đang diễn ra tại lúc nói',
        breakdown: { subject: 'The baby', verb: 'is sleeping', objectAndOthers: 'in the next room' },
      },
      {
        id: 'ex-2-2',
        en: 'I am staying with my cousin this week while my apartment is painted.',
        vi: 'Tuần này tôi đang ở tạm cùng anh họ trong khi căn hộ của tôi được sơn lại.',
        context: 'Tình huống tạm thời',
        breakdown: { subject: 'I', verb: 'am staying', objectAndOthers: 'with my cousin this week' },
      },
    ],
    exercises: [
      {
        id: 'q-2-1',
        question: 'Look! The bus ________ around the corner.',
        options: ['comes', 'is coming', 'came', 'has come'],
        correctAnswer: 1,
        explanation: 'Dấu hiệu "Look!" báo hiệu hành động đang diễn ra trước mắt -> "is coming".',
      },
      {
        id: 'q-2-2',
        question: 'She ________ to Japan next Monday; she already bought her tickets.',
        options: ['flies', 'is flying', 'flew', 'fly'],
        correctAnswer: 1,
        explanation: 'Kế hoạch tương lai chắc chắn đã có sự chuẩn bị (vé máy bay) -> "is flying".',
      },
    ],
    exam: {
      durationMinutes: 10,
      totalQuestions: 3,
      passScore: 2,
      questions: [
        {
          id: 'exm-2-1',
          question: 'Listen! Someone ________ on the front door.',
          options: ['knocks', 'is knocking', 'knocked', 'will knock'],
          correctAnswer: 1,
          explanation: 'Dấu hiệu "Listen!" thể hiện hành động đang diễn ra.',
        },
      ],
    },
  },
  {
    id: 't-3',
    number: 3,
    title: 'Hiện Tại Hoàn Thành',
    enTitle: 'Present Perfect',
    slug: 'present-perfect',
    summary: 'Trải nghiệm sống, hành động xảy ra trong quá khứ kéo dài đến hiện tại hoặc để lại kết quả.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 60,
    theory: {
      overview: 'Hiện tại hoàn thành nối liền quá khứ với hiện tại. Điểm mấu chốt là không có mốc thời gian quá khứ xác định cụ thể.',
      diagramRoot: 'Hiện Tại Hoàn Thành (Present Perfect)',
      formulas: [
        {
          type: 'Khẳng định (+)',
          pattern: 'S + have/has + V3/ed',
          note: 'I/You/We/They dùng have. He/She/It dùng has.',
        },
        {
          type: 'Phủ định (-)',
          pattern: 'S + have/has + not + V3/ed',
          note: 'haven\'t / hasn\'t.',
        },
        {
          type: 'Nghi vấn (?)',
          pattern: 'Have/Has + S + V3/ed?',
          note: 'Have you ever...?',
        },
      ],
      usages: [
        {
          title: 'Trải nghiệm cuộc sống tính đến hiện tại',
          detail: 'Từng làm hay chưa từng làm việc gì trong đời.',
          signals: ['ever', 'never', 'already', 'yet'],
        },
        {
          title: 'Hành động bắt đầu trong quá khứ và vẫn tiếp diễn',
          detail: 'Thường đi với For (khoảng thời gian) và Since (mốc thời gian).',
          signals: ['for 5 years', 'since 2020', 'so far', 'up to now'],
        },
        {
          title: 'Hành động vừa mới xảy ra và để lại kết quả rõ rệt',
          detail: 'Vừa hoàn thành một việc.',
          signals: ['just', 'recently', 'lately'],
        },
      ],
      notes: [
        'Since + mốc thời gian (since 8 AM, since yesterday). For + khoảng thời gian (for 3 days, for 2 hours).',
        'Phân biệt: "Gone to" (đi chưa về) vs "Been to" (đã từng đến và đã về).',
      ],
      pitfalls: [
        {
          wrong: 'I have seen him yesterday.',
          correct: 'I saw him yesterday.',
          explanation: 'Có mốc thời gian quá khứ xác định ("yesterday") bắt buộc phải dùng Quá khứ đơn.',
        },
      ],
    },
    examples: [
      {
        id: 'ex-3-1',
        en: 'I have lived in this city for over ten years now.',
        vi: 'Tôi đã sống ở thành phố này hơn 10 năm nay rồi.',
        context: 'Hành động kéo dài từ quá khứ đến hiện tại',
        breakdown: { subject: 'I', verb: 'have lived', objectAndOthers: 'in this city for over ten years' },
      },
    ],
    exercises: [
      {
        id: 'q-3-1',
        question: 'She ________ Paris three times in her life.',
        options: ['visited', 'has visited', 'is visiting', 'visits'],
        correctAnswer: 1,
        explanation: 'Trải nghiệm cuộc sống không có mốc thời gian cụ thể -> "has visited".',
      },
    ],
    exam: {
      durationMinutes: 10,
      totalQuestions: 2,
      passScore: 2,
      questions: [
        {
          id: 'exm-3-1',
          question: 'We ________ each other since we were in high school.',
          options: ['knew', 'have known', 'know', 'had known'],
          correctAnswer: 1,
          explanation: 'Cấu trúc Since + mốc quá khứ -> vế chính dùng Present Perfect: "have known".',
        },
      ],
    },
  },
  {
    id: 't-4',
    number: 4,
    title: 'Hiện Tại Hoàn Thành Tiếp Diễn',
    enTitle: 'Present Perfect Continuous',
    slug: 'present-perfect-continuous',
    summary: 'Nhấn mạnh sự liên tục và thời lượng kéo dài của hành động bắt đầu từ quá khứ đến nay.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 20,
    completedPercent: 40,
    theory: {
      overview: 'Khác với Hiện tại hoàn thành tập trung vào kết quả, thì tiếp diễn tập trung vào sự liên tục và đổ mồ hôi công sức kéo dài của hành động.',
      formulas: [
        { type: 'Cấu trúc', pattern: 'S + have/has been + V-ing', note: 'Thường kèm How long, all day, for hours' },
      ],
      usages: [
        { title: 'Nhấn mạnh thời lượng kéo dài không gián đoạn', detail: 'Hành động vẫn chưa kết thúc hoặc vừa mới dứt để lại hậu quả hiện tại.' },
      ],
      notes: ['I am tired because I have been running for 2 hours.'],
      pitfalls: [{ wrong: 'I have been knowing him for 3 years.', correct: 'I have known him for 3 years.', explanation: 'Know là động từ trạng thái, không dùng thì tiếp diễn.' }],
    },
    examples: [
      { id: 'ex-4-1', en: 'It has been raining all morning and the ground is soaked.', vi: 'Trời mưa rả rích suốt cả buổi sáng và mặt đất ướt sũng.', context: 'Hành động liên tục để lại dấu vết', breakdown: { subject: 'It', verb: 'has been raining', objectAndOthers: 'all morning' } },
    ],
    exercises: [
      { id: 'q-4-1', question: 'He is exhausted because he ________ all night.', options: ['has been studying', 'studies', 'studied', 'is studying'], correctAnswer: 0, explanation: 'Nhấn mạnh quá trình học liên tục cả đêm để lại hậu quả kiệt sức.' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-5',
    number: 5,
    title: 'Quá Khứ Đơn & Bất Quy Tắc',
    enTitle: 'Past Simple & Irregular Verbs',
    slug: 'past-simple',
    summary: 'Hành động đã xảy ra và chấm dứt hoàn toàn tại một thời điểm xác định trong quá khứ.',
    level: 'Beginner',
    difficulty: 'A1-A2',
    estimatedMinutes: 25,
    completedPercent: 90,
    theory: {
      overview: 'Dùng khi mốc thời gian quá khứ đã được xác định rõ ràng hoặc chuỗi các hành động kế tiếp nhau trong câu chuyện quá khứ.',
      formulas: [
        { type: 'Khẳng định (+)', pattern: 'S + V2/ed + O', note: 'Động từ quy tắc thêm -ed, bất quy tắc tra cột 2.' },
        { type: 'Phủ định (-)', pattern: 'S + did not (didn\'t) + V(nguyên mẫu)', note: 'Mọi chủ ngữ đều dùng didn\'t.' },
        { type: 'Nghi vấn (?)', pattern: 'Did + S + V(nguyên mẫu)?', note: 'Đảo Did lên đầu.' },
      ],
      usages: [
        { title: 'Thời điểm quá khứ xác định', detail: 'Hành động đã kết thúc.', signals: ['yesterday', 'ago', 'in 2019', 'last night'] },
      ],
      notes: ['Học thuộc 360 động từ bất quy tắc thông dụng (go-went, buy-bought, see-saw).'],
      pitfalls: [{ wrong: 'She didn\'t went to school yesterday.', correct: 'She didn\'t go to school yesterday.', explanation: 'Sau didn\'t động từ phải nguyên thể.' }],
    },
    examples: [
      { id: 'ex-5-1', en: 'They bought their dream house two years ago.', vi: 'Họ đã mua ngôi nhà mơ ước cách đây hai năm.', context: 'Quá khứ có mốc thời gian "ago"', breakdown: { subject: 'They', verb: 'bought', objectAndOthers: 'their dream house two years ago' } },
    ],
    exercises: [
      { id: 'q-5-1', question: 'Where ________ you go on your summer vacation last year?', options: ['did', 'do', 'were', 'had'], correctAnswer: 0, explanation: 'Trợ động từ quá khứ đơn là "did".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 2, questions: [] },
  },
  {
    id: 't-6',
    number: 6,
    title: 'Quá Khứ Tiếp Diễn',
    enTitle: 'Past Continuous',
    slug: 'past-continuous',
    summary: 'Hành động đang diễn ra tại một thời điểm cụ thể trong quá khứ hoặc bị hành động khác xen vào.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 20,
    completedPercent: 55,
    theory: {
      overview: 'Thường phối hợp với When và While để diễn tả một hành động đang diễn ra thì có hành động ngắn khác cắt ngang.',
      formulas: [
        { type: 'Cấu trúc', pattern: 'S + was/were + V-ing', note: 'I/He/She/It dùng was, You/We/They dùng were.' },
      ],
      usages: [
        { title: 'Tại thời điểm cụ thể trong quá khứ', detail: 'Ví dụ: At 8 PM yesterday, I was studying.' },
        { title: 'Hành động dài đang xảy ra thì hành động ngắn xen vào', detail: 'While S + was/were V-ing, S + V2/ed.' },
      ],
      notes: ['While thường đi với tiếp diễn, When thường đi với quá khứ đơn.'],
      pitfalls: [{ wrong: 'While I cooked, the phone rang.', correct: 'While I was cooking, the phone rang.', explanation: 'Hành động đang nấu ăn là hành động kéo dài nền.' }],
    },
    examples: [
      { id: 'ex-6-1', en: 'While I was driving home, I saw a shooting star.', vi: 'Khi tôi đang lái xe về nhà, tôi nhìn thấy một ngôi sao băng.', context: 'Hành động đang diễn ra bị cắt ngang', breakdown: { subject: 'I', verb: 'was driving', objectAndOthers: 'home' } },
    ],
    exercises: [
      { id: 'q-6-1', question: 'At 10 PM last night, we ________ an interesting documentary.', options: ['were watching', 'watched', 'are watching', 'watch'], correctAnswer: 0, explanation: 'Thời điểm cụ thể trong quá khứ (10 PM last night).' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 2, questions: [] },
  },
  {
    id: 't-7',
    number: 7,
    title: 'Quá Khứ Hoàn Thành',
    enTitle: 'Past Perfect',
    slug: 'past-perfect',
    summary: 'Hành động đã hoàn thành TRƯỚC một hành động khác hoặc một mốc thời điểm trong quá khứ.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 45,
    theory: {
      overview: 'Thì của "quá khứ của quá khứ" (hành động xảy ra trước dùng Past Perfect, xảy ra sau dùng Past Simple).',
      formulas: [
        { type: 'Cấu trúc', pattern: 'S + had + V3/ed', note: 'Áp dụng cho mọi chủ ngữ.' },
      ],
      usages: [
        { title: 'Trước một hành động quá khứ khác', signals: ['Before', 'After', 'By the time'] },
      ],
      notes: ['By the time + S + V2/ed, S + had + V3/ed.'],
      pitfalls: [{ wrong: 'When I arrived, the train already left.', correct: 'When I arrived, the train had already left.', explanation: 'Tàu chạy trước khi tôi tới ga.' }],
    },
    examples: [
      { id: 'ex-7-1', en: 'By the time the fire brigade arrived, the neighbors had put out the fire.', vi: 'Trước khi đội cứu hỏa đến, hàng xóm đã dập tắt đám cháy.', context: 'Hành động dập lửa xảy ra trước', breakdown: { subject: 'the neighbors', verb: 'had put out', objectAndOthers: 'the fire' } },
    ],
    exercises: [
      { id: 'q-7-1', question: 'She ________ dinner before her husband came home.', options: ['had prepared', 'prepared', 'has prepared', 'prepares'], correctAnswer: 0, explanation: 'Hành động nấu cơm xong trước khi chồng về.' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-8',
    number: 8,
    title: 'Tương Lai Đơn & Be Going To',
    enTitle: 'Future Forms (Will vs Be Going To)',
    slug: 'future-forms',
    summary: 'Quyết định tức thời (Will) vs Kế hoạch có dự tính từ trước hoặc có bằng chứng (Be Going To).',
    level: 'Beginner',
    difficulty: 'A1-A2',
    estimatedMinutes: 20,
    completedPercent: 80,
    theory: {
      overview: 'Phân biệt ý định tự phát ngay lúc nói (Will) và kế hoạch đã lên lịch từ trước / dự đoán có bằng chứng cụ thể (Be going to).',
      formulas: [
        { type: 'Will', pattern: 'S + will + V(nguyên mẫu)', note: 'Lời hứa, dự đoán chủ quan, quyết định chớp nhoáng.' },
        { type: 'Be Going To', pattern: 'S + am/is/are going to + V(nguyên mẫu)', note: 'Kế hoạch đã có từ trước, dự đoán có căn cứ mắt thấy.' },
      ],
      usages: [
        { title: 'Dự đoán có bằng chứng', detail: 'Look at those dark clouds! It is going to rain.' },
      ],
      notes: ['Lời hứa: I promise I will not tell anyone.'],
      pitfalls: [{ wrong: 'Look at the sky! It will rain.', correct: 'Look at the sky! It is going to rain.', explanation: 'Có bằng chứng trời mây đen rõ rệt.' }],
    },
    examples: [
      { id: 'ex-8-1', en: 'The doorbell is ringing. I will go and open it.', vi: 'Chuông cửa đang reo. Tôi sẽ ra mở cửa.', context: 'Quyết định ngay tức khắc tại thời điểm nói', breakdown: { subject: 'I', verb: 'will go', objectAndOthers: 'and open it' } },
    ],
    exercises: [
      { id: 'q-8-1', question: 'Watch out! That ladder ________ fall!', options: ['is going to', 'will', 'shall', 'goes to'], correctAnswer: 0, explanation: 'Có bằng chứng nguy hiểm ngay trước mắt.' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-9',
    number: 9,
    title: 'Tương Lai Tiếp Diễn & Hoàn Thành',
    enTitle: 'Future Continuous & Perfect',
    slug: 'future-continuous-perfect',
    summary: 'Hành động đang diễn ra tại một điểm tương lai (Continuous) hoặc đã hoàn tất trước một mốc (Perfect).',
    level: 'Advanced',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 30,
    theory: {
      overview: 'Future Continuous (will be V-ing) & Future Perfect (will have V3/ed by + mốc tương lai).',
      formulas: [
        { type: 'Tương lai tiếp diễn', pattern: 'S + will be + V-ing', note: 'At this time tomorrow' },
        { type: 'Tương lai hoàn thành', pattern: 'S + will have + V3/ed', note: 'By next year / By 2030' },
      ],
      usages: [{ title: 'Mốc hạn định hoàn thành', signals: ['By the end of this month', 'By 2030'] }],
      notes: ['By tomorrow, I will have finished this report.'],
      pitfalls: [{ wrong: 'By 2026, I will graduate.', correct: 'By 2026, I will have graduated.', explanation: 'Có "By + mốc tương lai" phải dùng thì hoàn thành.' }],
    },
    examples: [
      { id: 'ex-9-1', en: 'By next June, she will have worked here for five years.', vi: 'Tính đến tháng 6 năm sau, cô ấy sẽ làm việc ở đây được tròn 5 năm.', context: 'Hoàn thành trước mốc tương lai', breakdown: { subject: 'she', verb: 'will have worked', objectAndOthers: 'here for five years' } },
    ],
    exercises: [
      { id: 'q-9-1', question: 'By the time you wake up, I ________ for the airport.', options: ['will have left', 'will leave', 'leave', 'am leaving'], correctAnswer: 0, explanation: 'Hành động đi sân bay hoàn thành trước khi bạn thức dậy.' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-10',
    number: 10,
    title: 'Câu Điều Kiện (Conditionals)',
    enTitle: 'Conditionals (0, 1, 2, 3 & Mixed)',
    slug: 'conditionals',
    summary: 'Các loại câu điều kiện diễn tả giả định có thật, không có thật ở hiện tại/quá khứ và hỗn hợp.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 30,
    completedPercent: 65,
    theory: {
      overview: 'Cốt lõi là nguyên lý lùi thì để thể hiện mức độ xa rời thực tế.',
      formulas: [
        { type: 'Loại 0 (Quy luật)', pattern: 'If + S + V(hiện tại), S + V(hiện tại)', note: 'Chân lý tự nhiên: If you heat ice, it melts.' },
        { type: 'Loại 1 (Có thể xảy ra)', pattern: 'If + S + V(hiện tại), S + will + V(nguyên mẫu)', note: 'Tương lai có thể xảy ra: If it rains, I will stay home.' },
        { type: 'Loại 2 (Trái với hiện tại)', pattern: 'If + S + V2/were, S + would + V(nguyên mẫu)', note: 'Giả định hiện tại: If I had money, I would buy that car.' },
        { type: 'Loại 3 (Trái với quá khứ)', pattern: 'If + S + had + V3/ed, S + would have + V3/ed', note: 'Hối tiếc quá khứ: If I had studied, I would have passed.' },
      ],
      usages: [{ title: 'Giả định phi thực tế & Hối tiếc', detail: 'To be ở loại 2 luôn dùng Were cho mọi ngôi.' }],
      notes: ['Unless = If not.'],
      pitfalls: [{ wrong: 'If I was you, I would apologize.', correct: 'If I were you, I would apologize.', explanation: 'Trong văn phong chuẩn tắc loại 2 luôn dùng were.' }],
    },
    examples: [
      { id: 'ex-10-1', en: 'If she had listened to the mentor, she would not have made that costly mistake.', vi: 'Nếu cô ấy chịu lắng nghe người hướng dẫn, cô ấy đã không phạm phải sai lầm tai hại đó.', context: 'Hối tiếc sự việc trong quá khứ (Loại 3)', breakdown: { subject: 'she', verb: 'would not have made', objectAndOthers: 'that costly mistake' } },
    ],
    exercises: [
      { id: 'q-10-1', question: 'If I ________ the lottery, I would travel around the world.', options: ['won', 'win', 'had won', 'have won'], correctAnswer: 0, explanation: 'Mệnh đề chính dùng would travel (Loại 2) -> vế If lùi thì về quá khứ "won".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 3, passScore: 2, questions: [] },
  },
  {
    id: 't-11',
    number: 11,
    title: 'Câu Bị Động & Truyền Khiến',
    enTitle: 'Passive Voice & Causatives',
    slug: 'passive-voice',
    summary: 'Nhấn mạnh đối tượng chịu tác động của hành động thay vì người thực hiện.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 50,
    theory: {
      overview: 'Chuyển trọng tâm từ chủ ngữ gây ra hành động sang đối tượng tiếp nhận hành động (Object -> Subject).',
      formulas: [
        { type: 'Cấu trúc tổng quát', pattern: 'S + Be + V3/ed (+ by O)', note: 'Be chia theo thì của câu chủ động.' },
        { type: 'Thể truyền khiến', pattern: 'Have/Get sth done', note: 'Nhờ ai làm gì: I had my hair cut.' },
      ],
      usages: [{ title: 'Khi người thực hiện không quan trọng hoặc ai cũng biết', detail: 'Formal / Academic writing.' }],
      notes: ['Nội động từ (happen, occur, arrive) không có dạng bị động.'],
      pitfalls: [{ wrong: 'The accident was happened.', correct: 'The accident happened.', explanation: 'Happen là nội động từ, không bao giờ chia bị động.' }],
    },
    examples: [
      { id: 'ex-11-1', en: 'The new bridge was built by foreign contractors in 2024.', vi: 'Cây cầu mới được xây dựng bởi các nhà thầu nước ngoài vào năm 2024.', context: 'Bị động quá khứ đơn', breakdown: { subject: 'The new bridge', verb: 'was built', objectAndOthers: 'by foreign contractors' } },
    ],
    exercises: [
      { id: 'q-11-1', question: 'English ________ as a second language in many countries.', options: ['is spoken', 'speaks', 'is speaking', 'spoke'], correctAnswer: 0, explanation: 'Tiếng Anh được nói -> bị động hiện tại "is spoken".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-12',
    number: 12,
    title: 'Câu Gián Tiếp (Reported Speech)',
    enTitle: 'Reported Speech & Reporting Verbs',
    slug: 'reported-speech',
    summary: 'Thuật lại lời nói của người khác với quy tắc lùi thì, đổi đại từ và trạng từ chỉ thời gian/nơi chốn.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 40,
    theory: {
      overview: '3 bước chuyển đổi: Đổi đại từ nhân xưng, lùi một thì về quá khứ, đổi trạng từ không gian/thời gian.',
      formulas: [
        { type: 'Lùi thì', pattern: 'Hiện tại đơn -> Quá khứ đơn; Hiện tại hoàn thành -> Quá khứ hoàn thành', note: 'Will -> Would, Can -> Could' },
      ],
      usages: [{ title: 'Tường thuật câu kể, câu hỏi và mệnh lệnh', detail: 'Say to sb -> Tell sb.' }],
      notes: ['Trạng từ: now -> then, today -> that day, tomorrow -> the next day, here -> there.'],
      pitfalls: [{ wrong: 'He said me that he was tired.', correct: 'He told me that he was tired.', explanation: 'Tell sb (không giới từ) còn Say to sb.' }],
    },
    examples: [
      { id: 'ex-12-1', en: 'She told me that she was leaving for London the following day.', vi: 'Cô ấy nói với tôi rằng cô ấy sẽ lên đường đi Luân Đôn vào ngày hôm sau.', context: 'Tường thuật lùi thì', breakdown: { subject: 'She', verb: 'told', objectAndOthers: 'me that she was leaving' } },
    ],
    exercises: [
      { id: 'q-12-1', question: '"I am busy today," he said. -> He said that he ________ busy that day.', options: ['was', 'is', 'had been', 'will be'], correctAnswer: 0, explanation: 'Lùi thì từ "am" về "was".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-13',
    number: 13,
    title: 'Mệnh Đề Quan Hệ',
    enTitle: 'Relative Clauses (Who, Which, That)',
    slug: 'relative-clauses',
    summary: 'Nối hai câu đơn thành một câu phức logic bằng đại từ quan hệ (Xác định & Không xác định).',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 35,
    theory: {
      overview: 'Who (người), Whom (tân ngữ người), Which (vật), That (thay thế Who/Which trong MĐ xác định), Whose (sở hữu).',
      formulas: [
        { type: 'MĐ Quan Hệ Xác Định', pattern: 'Không có dấu phẩy, không thể lược bỏ đại từ nếu làm chủ ngữ', note: 'Dùng được That' },
        { type: 'MĐ Quan Hệ Không Xác Định', pattern: 'Có dấu phẩy, bổ sung thông tin phụ', note: 'Tuyệt đối KHÔNG dùng That' },
      ],
      usages: [{ title: 'Rút gọn mệnh đề quan hệ', detail: 'Chủ động dùng V-ing, Bị động dùng V3/ed.' }],
      notes: ['Sau dấu phẩy và giới từ không bao giờ dùng That.'],
      pitfalls: [{ wrong: 'My mother, that is a doctor, works hard.', correct: 'My mother, who is a doctor, works hard.', explanation: 'Mệnh đề có dấu phẩy không dùng that.' }],
    },
    examples: [
      { id: 'ex-13-1', en: 'The applicant whose portfolio impressed the board was hired immediately.', vi: 'Ứng viên có hồ sơ năng lực gây ấn tượng với hội đồng đã được tuyển dụng ngay lập tức.', context: 'Mệnh đề quan hệ sở hữu', breakdown: { subject: 'The applicant', verb: 'was hired', objectAndOthers: 'immediately' } },
    ],
    exercises: [
      { id: 'q-13-1', question: 'The woman ________ lives next door is a concert pianist.', options: ['who', 'which', 'whom', 'whose'], correctAnswer: 0, explanation: 'Chỉ người làm chủ ngữ của mệnh đề quan hệ -> "who".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-14',
    number: 14,
    title: 'Động Từ Khuyết Thiếu (Modal Verbs)',
    enTitle: 'Modal Verbs & Modals of Deduction',
    slug: 'modal-verbs',
    summary: 'Khả năng, sự cho phép, nghĩa vụ bắt buộc và suy đoán logic trong quá khứ (Must have done).',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 60,
    theory: {
      overview: 'Can/Could (khả năng), Must/Have to (bắt buộc), Should/Ought to (khuyên nhủ), May/Might (xác suất).',
      formulas: [
        { type: 'Hiện tại', pattern: 'S + Modal + V(nguyên mẫu)', note: 'Không chia ngôi số ít.' },
        { type: 'Suy đoán quá khứ', pattern: 'Must have + V3/ed (chắc chắn đã)', note: 'Can\'t have + V3/ed (chắc chắn không)' },
      ],
      usages: [{ title: 'Suy đoán logic trong quá khứ', detail: 'The lights are off. They must have left.' }],
      notes: ['Mustn\'t = Cấm; Don\'t have to = Không cần thiết.'],
      pitfalls: [{ wrong: 'You mustn\'t come if you are tired.', correct: 'You don\'t have to come if you are tired.', explanation: 'Không cần đến (không ép buộc) dùng don\'t have to.' }],
    },
    examples: [
      { id: 'ex-14-1', en: 'He can speak three languages fluently.', vi: 'Anh ấy có thể nói trôi chảy ba ngôn ngữ.', context: 'Năng lực cá nhân', breakdown: { subject: 'He', verb: 'can speak', objectAndOthers: 'three languages fluently' } },
    ],
    exercises: [
      { id: 'q-14-1', question: 'You ________ drive without wearing your seatbelt; it is strictly illegal.', options: ['mustn\'t', 'don\'t have to', 'might not', 'shouldn\'t'], correctAnswer: 0, explanation: 'Hành vi bị pháp luật nghiêm cấm -> "mustn\'t".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-15',
    number: 15,
    title: 'Danh Động Từ & Động Từ Nguyên Mẫu',
    enTitle: 'Gerunds & Infinitives (V-ing vs To-V)',
    slug: 'gerunds-infinitives',
    summary: 'Các động từ đi kèm V-ing (enjoy, avoid), To-V (decide, hope) và đổi nghĩa (remember, stop, try).',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 50,
    theory: {
      overview: 'Phân loại các cụm động từ đi với V-ing, To-V và những động từ thay đổi ngữ nghĩa hoàn toàn.',
      formulas: [
        { type: 'V + V-ing', pattern: 'avoid, consider, delay, enjoy, finish, mind, suggest', note: 'Sau giới từ luôn là V-ing' },
        { type: 'V + To-V', pattern: 'agree, decide, hope, manage, promise, refuse, want', note: 'Ý hướng tương lai' },
        { type: 'Đổi nghĩa', pattern: 'Stop to V (dừng lại để làm) vs Stop V-ing (dừng hẳn hành động)', note: 'Remember, forget, try, regret' },
      ],
      usages: [{ title: 'V-ing làm chủ ngữ câu', detail: 'Swimming is good for health.' }],
      notes: ['Look forward to + V-ing.'],
      pitfalls: [{ wrong: 'I look forward to hear from you.', correct: 'I look forward to hearing from you.', explanation: '"To" ở đây là giới từ, sau nó là V-ing.' }],
    },
    examples: [
      { id: 'ex-15-1', en: 'She decided to study medicine abroad.', vi: 'Cô ấy quyết định du học ngành y khoa.', context: 'Quyết định tương lai', breakdown: { subject: 'She', verb: 'decided to study', objectAndOthers: 'medicine abroad' } },
    ],
    exercises: [
      { id: 'q-15-1', question: 'Do you mind ________ the window? It is getting cold.', options: ['closing', 'to close', 'close', 'closed'], correctAnswer: 0, explanation: 'Cấu trúc "mind + V-ing".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-16',
    number: 16,
    title: 'Mạo Từ (Articles: A, An, The & ∅)',
    enTitle: 'Articles (A, An, The & Zero Article)',
    slug: 'articles',
    summary: 'Quy tắc dùng mạo từ xác định The, bất định A/An và các trường hợp không dùng mạo từ.',
    level: 'Beginner',
    difficulty: 'A1-A2',
    estimatedMinutes: 20,
    completedPercent: 75,
    theory: {
      overview: 'A/An dùng cho danh từ đếm được số ít nhắc tới lần đầu. The dùng cho đối tượng cả hai người nói/nghe đều biết rõ.',
      formulas: [
        { type: 'A vs An', pattern: 'Phụ thuộc vào PHIÊN ÂM mở đầu (nguyên âm / phụ âm)', note: 'An hour (âm câm), A university (âm /j/)' },
      ],
      usages: [{ title: 'Dùng THE', detail: 'Vật thể duy nhất (the sun), tên đại dương, dãy núi, nhạc cụ.' }],
      notes: ['Zero article: Tên bữa ăn, môn thể thao, ngôn ngữ, tên quốc gia đơn lẻ.'],
      pitfalls: [{ wrong: 'He is studying at a university.', correct: 'He is studying at a university.', explanation: 'Đúng là "a university" vì âm đầu là /juː/ (phụ âm).' }],
    },
    examples: [
      { id: 'ex-16-1', en: 'The sun rises in the east.', vi: 'Mặt trời mọc ở hướng đông.', context: 'Vật thể duy nhất', breakdown: { subject: 'The sun', verb: 'rises', objectAndOthers: 'in the east' } },
    ],
    exercises: [
      { id: 'q-16-1', question: 'She has been waiting for ________ hour.', options: ['an', 'a', 'the', '∅'], correctAnswer: 0, explanation: '"Hour" phát âm /aʊər/ bắt đầu bằng nguyên âm -> "an".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-17',
    number: 17,
    title: 'Giới Từ (Prepositions: In, On, At)',
    enTitle: 'Prepositions of Time & Place',
    slug: 'prepositions',
    summary: 'Tam giác giới từ In (rộng) -> On (vừa) -> At (cụ thể điểm) cho cả không gian và thời gian.',
    level: 'Beginner',
    difficulty: 'A1-A2',
    estimatedMinutes: 20,
    completedPercent: 70,
    theory: {
      overview: 'Quy tắc kim tự tháp: In (năm, tháng, mùa, quốc gia) -> On (thứ, ngày cụ thể, tên đường) -> At (giờ giấc, địa chỉ số nhà).',
      formulas: [
        { type: 'Thời gian', pattern: 'In 2026, In summer; On Monday, On May 5th; At 8:00 AM, At noon', note: 'Quy tắc từ rộng đến hẹp' },
        { type: 'Địa điểm', pattern: 'In Vietnam, In Hanoi; On Tran Phu Street; At 123 Tran Phu Street', note: 'Từ vùng rộng đến điểm chính xác' },
      ],
      usages: [{ title: 'Giới từ đi với phương tiện', detail: 'In a car/taxi (xe nhỏ); On a bus/plane/train (phương tiện lớn đi lại được).' }],
      notes: ['At night, At the weekend, In the morning.'],
      pitfalls: [{ wrong: 'I was born in May 12th.', correct: 'I was born on May 12th.', explanation: 'Có ngày cụ thể phải dùng "on".' }],
    },
    examples: [
      { id: 'ex-17-1', en: 'The crucial conference takes place at 9 AM on Monday in London.', vi: 'Hội nghị quan trọng diễn ra lúc 9 giờ sáng thứ Hai tại Luân Đôn.', context: 'Phối hợp cả At, On, In', breakdown: { subject: 'The conference', verb: 'takes place', objectAndOthers: 'at 9 AM on Monday in London' } },
    ],
    exercises: [
      { id: 'q-17-1', question: 'The concert begins ________ 8:00 PM ________ Saturday.', options: ['at / on', 'on / in', 'in / at', 'at / in'], correctAnswer: 0, explanation: 'Giờ cụ thể (at), thứ trong tuần (on).' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-18',
    number: 18,
    title: 'Tính Từ, Trạng Từ & So Sánh',
    enTitle: 'Adjectives, Adverbs & Comparisons',
    slug: 'comparisons',
    summary: 'So sánh hơn, so sánh nhất, so sánh bằng, so sánh kép và trật tự tính từ OSASCOMP.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 55,
    theory: {
      overview: 'Quy tắc so sánh tính từ ngắn/dài và trật tự tính từ đứng trước danh từ OSASCOMP.',
      formulas: [
        { type: 'So sánh hơn', pattern: 'Ngắn: adj-er than; Dài: more + adj + than', note: 'Bất quy tắc: good -> better, bad -> worse' },
        { type: 'So sánh nhất', pattern: 'Ngắn: the adj-est; Dài: the most + adj', note: 'the best, the worst' },
        { type: 'So sánh kép', pattern: 'The more..., the more... (Càng... càng...)', note: 'The more you practice, the better you become.' },
      ],
      usages: [{ title: 'Trật tự tính từ OSASCOMP', detail: 'Opinion -> Size -> Age -> Shape -> Color -> Origin -> Material -> Purpose.' }],
      notes: ['Tính từ tận cùng bằng -y (happy -> happier) tính là ngắn.'],
      pitfalls: [{ wrong: 'He is more taller than me.', correct: 'He is taller than me.', explanation: 'Tall là tính từ ngắn, chỉ thêm -er không thêm more.' }],
    },
    examples: [
      { id: 'ex-18-1', en: 'The harder you study, the higher score you achieve.', vi: 'Bạn càng học chăm chỉ, bạn càng đạt điểm số cao.', context: 'So sánh kép', breakdown: { subject: 'You', verb: 'study / achieve', objectAndOthers: 'harder / higher score' } },
    ],
    exercises: [
      { id: 'q-18-1', question: 'This laptop is significantly ________ than my old one.', options: ['faster', 'more fast', 'fastest', 'more faster'], correctAnswer: 0, explanation: 'Fast là tính từ ngắn -> faster.' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-19',
    number: 19,
    title: 'Liên Từ & Mệnh Đề Trạng Ngữ',
    enTitle: 'Conjunctions & Adverbial Clauses',
    slug: 'conjunctions-clauses',
    summary: 'Mệnh đề chỉ nguyên nhân (Because), nhượng bộ (Although, Despite), mục đích và kết quả.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 40,
    theory: {
      overview: 'Phân biệt liên từ nối mệnh đề (Although, Because) với giới từ nối danh từ/cụm từ (Despite, In spite of, Because of).',
      formulas: [
        { type: 'Mệnh đề (S + V)', pattern: 'Although / Even though / Because + S + V', note: 'Đi kèm mệnh đề đầy đủ' },
        { type: 'Cụm từ (Noun / V-ing)', pattern: 'Despite / In spite of / Because of + Noun Phrase / V-ing', note: 'Không đi kèm mệnh đề có động từ chia thì' },
      ],
      usages: [{ title: 'Nhượng bộ (Concession)', detail: 'Although it rained heavily, they went camping.' }],
      notes: ['Không dùng cả Although và But trong cùng một câu.'],
      pitfalls: [{ wrong: 'Although he was ill, but he went to work.', correct: 'Although he was ill, he went to work.', explanation: 'Tiếng Anh không dùng cặp liên từ "Although... but".' }],
    },
    examples: [
      { id: 'ex-19-1', en: 'Despite the heavy rain, the football match was not canceled.', vi: 'Mặc dù trời mưa to, trận bóng đá vẫn không bị hủy.', context: 'Despite + Cụm danh từ', breakdown: { subject: 'the football match', verb: 'was not canceled', objectAndOthers: 'despite the heavy rain' } },
    ],
    exercises: [
      { id: 'q-19-1', question: '________ he had little experience, he got the management job.', options: ['Although', 'Despite', 'Because of', 'In spite of'], correctAnswer: 0, explanation: '"He had little experience" là mệnh đề có chủ ngữ và động từ -> dùng "Although".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-20',
    number: 20,
    title: 'Đảo Ngữ & Câu Chẻ (Inversion & Cleft)',
    enTitle: 'Inversion & Cleft Sentences',
    slug: 'inversion',
    summary: 'Cấu trúc nhấn mạnh cao cấp với trạng từ phủ định đứng đầu câu và It is... that.',
    level: 'Advanced',
    difficulty: 'C1',
    estimatedMinutes: 30,
    completedPercent: 20,
    theory: {
      overview: 'Đảo trợ động từ lên trước chủ ngữ khi các từ phủ định hoặc hạn định (Never, Hardly, Rarely, Not only) đứng đầu câu để tăng tính trang trọng.',
      formulas: [
        { type: 'Đảo ngữ phủ định', pattern: 'Negative Word + Trợ động từ + S + V(nguyên mẫu)', note: 'Never have I seen...; Hardly had S + V3 when...' },
        { type: 'Câu chẻ (Cleft)', pattern: 'It is/was + Thành phần nhấn mạnh + that + ...', note: 'It was Mark that broke the vase.' },
      ],
      usages: [{ title: 'Văn phong trang trọng C1 / Viết luận IELTS', detail: 'Tạo điểm nhấn kịch tính và gây ấn tượng học thuật.' }],
      notes: ['Not only... but also... đảo ngữ ở vế đầu tiên.'],
      pitfalls: [{ wrong: 'Never I have felt so humiliated.', correct: 'Never have I felt so humiliated.', explanation: 'Đảo trợ động từ have lên trước I.' }],
    },
    examples: [
      { id: 'ex-20-1', en: 'Hardly had we arrived at the summit when the snowstorm started.', vi: 'Vừa mới leo tới đỉnh núi thì cơn bão tuyết ập đến.', context: 'Đảo ngữ cấu trúc vừa mới... thì...', breakdown: { subject: 'we', verb: 'had arrived', objectAndOthers: 'at the summit' } },
    ],
    exercises: [
      { id: 'q-20-1', question: 'Seldom ________ such an inspiring speech in my professional career.', options: ['have I heard', 'I have heard', 'did I heard', 'I heard'], correctAnswer: 0, explanation: 'Đảo ngữ với Seldom: đảo trợ động từ "have" lên trước chủ ngữ "I".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
  {
    id: 't-21',
    number: 21,
    title: 'Sự Hòa Hợp Chủ Ngữ & Động Từ',
    enTitle: 'Subject-Verb Agreement',
    slug: 'subject-verb-agreement',
    summary: 'Quy tắc chia động từ theo chủ ngữ: Each, Every, Either/Neither, cụm danh từ tập hợp và bẫy đề thi.',
    level: 'Intermediate',
    difficulty: 'B1-B2',
    estimatedMinutes: 25,
    completedPercent: 50,
    theory: {
      overview: 'Động từ phải hòa hợp về số (ít hoặc nhiều) với chủ ngữ thực sự của câu, không bị gây nhiễu bởi các cụm giới từ chêm vào giữa.',
      formulas: [
        { type: 'Each / Every / Neither of', pattern: 'Luôn đi với động từ số ít (V-s/es / is / has)', note: 'Each of the students has a laptop.' },
        { type: 'Along with / As well as', pattern: 'Chia theo chủ ngữ ĐẦU TIÊN', note: 'The manager, along with his assistants, is attending.' },
        { type: 'Either... or / Neither... nor', pattern: 'Chia theo chủ ngữ GẦN NHẤT', note: 'Neither John nor his friends are coming.' },
      ],
      usages: [{ title: 'Các từ chỉ số lượng & Phân số', detail: 'Chia theo danh từ đứng sau "of" (Fifty percent of the milk is bad / of students are present).' }],
      notes: ['News, Physics, Mathematics, Economics dù có -s nhưng là danh từ số ít.'],
      pitfalls: [{ wrong: 'One of my friends are moving to Australia.', correct: 'One of my friends is moving to Australia.', explanation: 'Chủ ngữ chính là "One" (số ít) chứ không phải "friends".' }],
    },
    examples: [
      { id: 'ex-21-1', en: 'The quality of these handmade products is exceptionally high.', vi: 'Chất lượng của những sản phẩm thủ công này cao đặc biệt.', context: 'Chủ ngữ thật là "The quality" (số ít)', breakdown: { subject: 'The quality of these handmade products', verb: 'is', objectAndOthers: 'exceptionally high' } },
    ],
    exercises: [
      { id: 'q-21-1', question: 'Neither the manager nor his employees ________ aware of the system update.', options: ['were', 'was', 'is', 'has been'], correctAnswer: 0, explanation: 'Quy tắc Neither... nor chia theo chủ ngữ gần nhất "his employees" (số nhiều) -> "were".' },
    ],
    exam: { durationMinutes: 10, totalQuestions: 2, passScore: 1, questions: [] },
  },
];
