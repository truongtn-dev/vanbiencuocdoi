/* ========================================
   TYPES & RUNTIME CODE - NGÃ RẼ CUỘC ĐỜI
   ======================================== */

export interface Stats {
    money: number
    skill: number
    happiness: number
    stress: number
    health: number
    relationships: number
    [key: string]: number
}

export interface CareerLevel {
    title: string
    minSkill: number
    salary: number
}

export interface Career {
    id: string
    name: string
    emoji: string
    description: string
    startStats: Stats
    salary: number
    levels: CareerLevel[]
}

export interface Choice {
    text: string
    icon?: string
    hint?: string
    effects: Partial<Record<keyof Stats, number | [number, number]>>
    result: string | null
    isGameOver?: boolean
    gameOverReason?: {
        type: string
        message: string
        icon: string
    }
}

export interface GameEvent {
    id: string
    type: string
    title: string
    description: string
    minAge?: number
    maxAge?: number
    weight?: number
    oneTime?: boolean
    choices: Choice[]
    condition?: (s: Stats) => boolean
    triggerAge?: number
}

export interface EngineRef {
    state: GameState | null
}

export interface Achievement {
    id: string
    title: string
    emoji: string
    description: string
    condition: (s: Stats, engine: EngineRef) => boolean
}

export interface PassiveItem {
    id: string
    name: string
    description: string
    cost: number
    effect?: Partial<Stats>
    category: string
    unlockAge: number
    immunity?: string[]
}

export interface ActiveSkill {
    id: string
    name: string
    description: string
    cost: number
    cooldown: number
    category: string
    unlockAge: number
    effect: string
}

export interface HistoryEntry {
    age: number
    year: number
    text: string
}

export interface GameState {
    name: string
    careerId: string
    careerName: string
    careerEmoji: string
    age: number
    year: number
    stats: Stats
    history: HistoryEntry[]
    currentLevel: string
    salary: number
    achievements: { age: number; text: string }[]
    unlockedAchievements: string[]
    inventory: string[]
    activeSkills: string[]
    skillCooldowns: Record<string, number>
    activeBuffs: { type: string; duration: number }[]
    gameOver: boolean
    gameOverInfo?: {
        type?: string
        message?: string
        icon?: string
        reason?: string
    }
}

export interface GameDataJson {
    careers: Record<string, Career>
    commonEvents: GameEvent[]
    careerEvents: Record<string, GameEvent[]>
    dangerousEvents: GameEvent[]
    milestoneEvents: GameEvent[]
    passiveItems: PassiveItem[]
    activeSkills: ActiveSkill[]
}

// Condition functions for events that cannot be serialized to JSON
const EVENT_CONDITIONS: Record<string, (s: Stats) => boolean> = {
    danger_scam_investment: (s: Stats) => s.money >= 30,
}

const FALLBACK_GAME_DATA: GameDataJson = {
    careers: {
        office: {
            id: 'office',
            name: 'Nhân viên văn phòng',
            emoji: '💼',
            description: 'Ổn định, bền bỉ và nhiều cơ hội thăng tiến.',
            startStats: { money: 45, skill: 40, happiness: 50, stress: 35, health: 55, relationships: 50 },
            salary: 8,
            levels: [
                { title: 'Nhân viên mới', minSkill: 0, salary: 8 },
                { title: 'Chuyên viên', minSkill: 45, salary: 12 },
                { title: 'Trưởng nhóm', minSkill: 70, salary: 16 },
                { title: 'Quản lý', minSkill: 85, salary: 20 },
            ],
        },
        developer: {
            id: 'developer',
            name: 'Lập trình viên',
            emoji: '💻',
            description: 'Sáng tạo công nghệ, tăng trưởng kỹ năng rất mạnh.',
            startStats: { money: 42, skill: 50, happiness: 46, stress: 40, health: 52, relationships: 42 },
            salary: 10,
            levels: [
                { title: 'Junior Developer', minSkill: 0, salary: 10 },
                { title: 'Mid Developer', minSkill: 50, salary: 14 },
                { title: 'Senior Developer', minSkill: 75, salary: 20 },
                { title: 'Tech Lead', minSkill: 90, salary: 25 },
            ],
        },
        doctor: {
            id: 'doctor',
            name: 'Bác sĩ',
            emoji: '🩺',
            description: 'Áp lực cao, thu nhập tốt, đóng góp lớn cho xã hội.',
            startStats: { money: 38, skill: 52, happiness: 48, stress: 45, health: 58, relationships: 52 },
            salary: 11,
            levels: [
                { title: 'Bác sĩ nội trú', minSkill: 0, salary: 11 },
                { title: 'Bác sĩ chính', minSkill: 55, salary: 16 },
                { title: 'Trưởng khoa', minSkill: 80, salary: 23 },
            ],
        },
        artist: {
            id: 'artist',
            name: 'Nghệ sĩ sáng tạo',
            emoji: '🎨',
            description: 'Tự do và cảm hứng, giàu cảm xúc và cá tính.',
            startStats: { money: 30, skill: 48, happiness: 58, stress: 38, health: 50, relationships: 55 },
            salary: 7,
            levels: [
                { title: 'Freelancer', minSkill: 0, salary: 7 },
                { title: 'Creator nổi bật', minSkill: 55, salary: 12 },
                { title: 'Biểu tượng sáng tạo', minSkill: 85, salary: 20 },
            ],
        },
        chef: {
            id: 'chef',
            name: 'Đầu bếp',
            emoji: '🍳',
            description: 'Môi trường năng động, áp lực giờ cao điểm nhưng rất giàu trải nghiệm.',
            startStats: { money: 36, skill: 47, happiness: 52, stress: 43, health: 51, relationships: 48 },
            salary: 9,
            levels: [
                { title: 'Phụ bếp', minSkill: 0, salary: 9 },
                { title: 'Bếp chính', minSkill: 52, salary: 14 },
                { title: 'Bếp trưởng', minSkill: 78, salary: 21 },
            ],
        },
        musician: {
            id: 'musician',
            name: 'Nhạc sĩ / Ca sĩ',
            emoji: '🎤',
            description: 'Theo đuổi đam mê nghệ thuật, cảm xúc thăng hoa và nhiều đột phá.',
            startStats: { money: 32, skill: 49, happiness: 60, stress: 36, health: 49, relationships: 57 },
            salary: 8,
            levels: [
                { title: 'Nghệ sĩ indie', minSkill: 0, salary: 8 },
                { title: 'Nghệ sĩ nổi bật', minSkill: 54, salary: 13 },
                { title: 'Ngôi sao sân khấu', minSkill: 82, salary: 22 },
            ],
        },
        entrepreneur: {
            id: 'entrepreneur',
            name: 'Doanh nhân',
            emoji: '🏢',
            description: 'Rủi ro cao, tiềm năng lớn; phù hợp người thích thử thách.',
            startStats: { money: 40, skill: 46, happiness: 45, stress: 50, health: 48, relationships: 54 },
            salary: 12,
            levels: [
                { title: 'Founder mới', minSkill: 0, salary: 12 },
                { title: 'CEO tăng trưởng', minSkill: 56, salary: 18 },
                { title: 'Nhà sáng lập thành công', minSkill: 84, salary: 28 },
            ],
        },
        finance: {
            id: 'finance',
            name: 'Chuyên gia tài chính',
            emoji: '💰',
            description: 'Nhạy bén với con số, thu nhập cạnh tranh và cơ hội đầu tư cao.',
            startStats: { money: 48, skill: 45, happiness: 42, stress: 47, health: 50, relationships: 46 },
            salary: 13,
            levels: [
                { title: 'Phân tích viên', minSkill: 0, salary: 13 },
                { title: 'Chuyên gia đầu tư', minSkill: 58, salary: 20 },
                { title: 'Giám đốc tài chính', minSkill: 86, salary: 30 },
            ],
        },
        teacher: {
            id: 'teacher',
            name: 'Giảng viên',
            emoji: '🎓',
            description: 'Truyền cảm hứng tri thức, phát triển bền vững và giàu ý nghĩa.',
            startStats: { money: 35, skill: 53, happiness: 54, stress: 34, health: 56, relationships: 58 },
            salary: 8,
            levels: [
                { title: 'Trợ giảng', minSkill: 0, salary: 8 },
                { title: 'Giảng viên chính', minSkill: 50, salary: 13 },
                { title: 'Trưởng bộ môn', minSkill: 80, salary: 20 },
            ],
        },
    },
    commonEvents: [
        {
            id: 'common_upgrade_skills',
            type: '🧠 Phát triển',
            title: 'Một khóa học mới xuất hiện',
            description: 'Bạn có cơ hội học thêm để nâng tầm bản thân.',
            weight: 8,
            choices: [
                { text: 'Đăng ký ngay', icon: '📚', hint: 'Kỹ năng tăng mạnh', effects: { skill: 12, money: -8, stress: 4 }, result: 'Bạn học được rất nhiều kiến thức hữu ích.' },
                { text: 'Tự học miễn phí', icon: '🧩', hint: 'Tiết kiệm chi phí', effects: { skill: 7, stress: 2 }, result: 'Bạn tiến bộ đều và ổn định.' },
            ],
        },
        {
            id: 'common_social_time',
            type: '🤝 Quan hệ',
            title: 'Bạn bè rủ đi gặp mặt',
            description: 'Một buổi tụ họp có thể giúp bạn thư giãn.',
            weight: 7,
            choices: [
                { text: 'Tham gia', icon: '🥳', hint: 'Quan hệ +, stress -', effects: { relationships: 10, happiness: 8, stress: -6 }, result: 'Bạn nạp lại năng lượng tích cực.' },
                { text: 'Ở nhà nghỉ ngơi', icon: '🛋️', hint: 'Sức khỏe +', effects: { health: 8, happiness: 3 }, result: 'Một buổi tối yên bình giúp bạn hồi phục.' },
            ],
        },
        {
            id: 'common_side_project',
            type: '🚀 Cơ hội',
            title: 'Có dự án phụ tiềm năng',
            description: 'Bạn cân nhắc tham gia để tăng thu nhập.',
            weight: 6,
            choices: [
                { text: 'Nhận dự án', icon: '💼', hint: 'Tiền +, stress +', effects: { money: 14, skill: 6, stress: 8 }, result: 'Dự án mang lại thu nhập đáng kể.' },
                { text: 'Từ chối để cân bằng', icon: '⚖️', hint: 'Giữ sức bền', effects: { health: 7, happiness: 5, money: -2 }, result: 'Bạn chọn nhịp sống bền vững hơn.' },
            ],
        },
    ],
    careerEvents: {
        office: [
            {
                id: 'career_office_promotion',
                type: '🏢 Công việc',
                title: 'Sếp giao nhiệm vụ lớn',
                description: 'Đây là cơ hội để bạn chứng minh năng lực.',
                weight: 8,
                choices: [
                    { text: 'Nhận thử thách', icon: '🔥', hint: 'Có cơ hội thăng tiến', effects: { skill: 10, money: 8, stress: 7 }, result: 'Nỗ lực của bạn được ghi nhận mạnh mẽ.' },
                    { text: 'Xin hỗ trợ từ đồng đội', icon: '👥', hint: 'An toàn hơn', effects: { relationships: 8, skill: 6, stress: 3 }, result: 'Bạn xử lý công việc hiệu quả và gắn kết hơn.' },
                ],
            },
        ],
        developer: [
            {
                id: 'career_dev_release',
                type: '💻 Sprint',
                title: 'Dự án chuẩn bị release',
                description: 'Nhóm cần quyết định chiến lược bàn giao.',
                weight: 8,
                choices: [
                    { text: 'Tăng tốc fix bug', icon: '🧪', hint: 'Kỹ năng +', effects: { skill: 11, stress: 8, money: 5 }, result: 'Sản phẩm ổn định hơn nhờ nỗ lực của bạn.' },
                    { text: 'Chốt phạm vi an toàn', icon: '🛡️', hint: 'Stress thấp hơn', effects: { stress: -3, relationships: 6, money: 2 }, result: 'Release mượt và team giữ được nhịp bền.' },
                ],
            },
        ],
        doctor: [
            {
                id: 'career_doctor_shift',
                type: '🩺 Trực viện',
                title: 'Ca trực áp lực cao',
                description: 'Bạn cần giữ bình tĩnh để đưa ra quyết định.',
                weight: 8,
                choices: [
                    { text: 'Tập trung tối đa', icon: '💪', hint: 'Kỹ năng + mạnh', effects: { skill: 12, stress: 10, happiness: 2 }, result: 'Bạn xử lý ca bệnh rất tốt.' },
                    { text: 'Phân phối công việc khoa học', icon: '📋', hint: 'Quan hệ +', effects: { relationships: 9, health: 4, stress: 2 }, result: 'Ca trực vẫn hiệu quả mà ít kiệt sức hơn.' },
                ],
            },
        ],
        artist: [
            {
                id: 'career_artist_showcase',
                type: '🎨 Triển lãm',
                title: 'Bạn được mời trưng bày tác phẩm',
                description: 'Một cơ hội tốt để nâng tên tuổi cá nhân.',
                weight: 8,
                choices: [
                    { text: 'Đầu tư mạnh cho showcase', icon: '✨', hint: 'Danh tiếng tăng', effects: { happiness: 10, relationships: 8, money: -10, skill: 7 }, result: 'Bạn tạo dấu ấn cá nhân rõ nét.' },
                    { text: 'Làm mini showcase', icon: '🎫', hint: 'An toàn tài chính', effects: { money: 4, happiness: 5, skill: 5 }, result: 'Sự kiện nhỏ nhưng vẫn hiệu quả.' },
                ],
            },
        ],
        chef: [
            {
                id: 'career_chef_festival',
                type: '🍽️ Ẩm thực',
                title: 'Nhà hàng tham gia lễ hội ẩm thực',
                description: 'Bạn có thể tranh tài để tạo dấu ấn nghề nghiệp.',
                weight: 8,
                choices: [
                    { text: 'Thi món mới', icon: '🔥', hint: 'Kỹ năng + mạnh', effects: { skill: 12, happiness: 6, stress: 7 }, result: 'Bạn gây ấn tượng với ban giám khảo.' },
                    { text: 'Giữ menu an toàn', icon: '✅', hint: 'Ổn định', effects: { money: 6, relationships: 6, stress: 2 }, result: 'Bạn đảm bảo hiệu quả và vận hành mượt.' },
                ],
            },
        ],
        musician: [
            {
                id: 'career_musician_stage',
                type: '🎶 Sân khấu',
                title: 'Cơ hội biểu diễn trước đông người',
                description: 'Một sân khấu lớn có thể thay đổi sự nghiệp của bạn.',
                weight: 8,
                choices: [
                    { text: 'Nhận show lớn', icon: '🎤', hint: 'Danh tiếng +', effects: { happiness: 10, relationships: 9, stress: 8, money: 6 }, result: 'Bạn bùng nổ và được chú ý mạnh.' },
                    { text: 'Chọn show vừa sức', icon: '🎼', hint: 'Bền hơn', effects: { skill: 7, stress: -2, money: 4 }, result: 'Bạn tích lũy đều và an toàn hơn.' },
                ],
            },
        ],
        entrepreneur: [
            {
                id: 'career_startup_pitch',
                type: '🚀 Startup',
                title: 'Buổi pitching gọi vốn',
                description: 'Bạn đứng trước nhà đầu tư để gọi vốn dự án.',
                weight: 8,
                choices: [
                    { text: 'Pitch táo bạo', icon: '📈', hint: 'Tiền + nhưng stress +', effects: { money: 14, skill: 8, stress: 10 }, result: 'Bạn gọi được vốn đáng kể cho dự án.' },
                    { text: 'Tập trung vào sản phẩm', icon: '🧱', hint: 'Kỹ năng +', effects: { skill: 10, health: 4, money: 4 }, result: 'Sản phẩm vững hơn trước khi bùng nổ.' },
                ],
            },
        ],
        finance: [
            {
                id: 'career_finance_market',
                type: '📊 Thị trường',
                title: 'Thị trường biến động mạnh',
                description: 'Bạn cần chọn chiến lược quản trị rủi ro phù hợp.',
                weight: 8,
                choices: [
                    { text: 'Đánh nhanh cơ hội', icon: '⚡', hint: 'Tiền biến động', effects: { money: [-12, 18], stress: 8 }, result: 'Kết quả giao dịch dao động lớn.' },
                    { text: 'Phòng thủ danh mục', icon: '🛡️', hint: 'An toàn hơn', effects: { money: 6, stress: -2, relationships: 5 }, result: 'Bạn bảo toàn tốt và giữ niềm tin khách hàng.' },
                ],
            },
        ],
        teacher: [
            {
                id: 'career_teacher_class',
                type: '🏫 Giáo dục',
                title: 'Lớp học có nhiều học viên khó',
                description: 'Bạn cần đổi phương pháp để cải thiện kết quả.',
                weight: 8,
                choices: [
                    { text: 'Đổi mới giáo án', icon: '🧠', hint: 'Kỹ năng sư phạm +', effects: { skill: 10, happiness: 6, stress: 4 }, result: 'Lớp học tiến bộ rõ rệt.' },
                    { text: 'Kèm nhóm nhỏ', icon: '🤝', hint: 'Quan hệ +', effects: { relationships: 10, health: 4, money: 3 }, result: 'Bạn tạo được kết nối sâu với học viên.' },
                ],
            },
        ],
    },
    dangerousEvents: [
        {
            id: 'danger_scam_investment',
            type: '⚠️ Rủi ro',
            title: 'Một khoản đầu tư "siêu lợi nhuận"',
            description: 'Nghe có vẻ hấp dẫn nhưng cũng tiềm ẩn nguy hiểm.',
            weight: 4,
            choices: [
                { text: 'Đầu tư liều lĩnh', icon: '🎲', hint: 'Được ăn cả ngã về không', effects: { money: [-30, 25], stress: 12 }, result: 'Bạn chấp nhận mức biến động rất cao.' },
                { text: 'Từ chối và giữ vốn', icon: '🧱', hint: 'An toàn', effects: { money: 2, stress: -3 }, result: 'Bạn chọn phương án chắc chắn.' },
            ],
        },
    ],
    milestoneEvents: [
        {
            id: 'ms_age_30',
            type: '🎯 Cột mốc',
            title: 'Tuổi 30 - nhìn lại hành trình',
            description: 'Bạn muốn ưu tiên điều gì cho 5 năm tới?',
            triggerAge: 30,
            oneTime: true,
            choices: [
                { text: 'Dồn lực cho sự nghiệp', icon: '📈', hint: 'Kỹ năng +', effects: { skill: 10, money: 10, stress: 8 }, result: 'Bạn bước vào giai đoạn tăng tốc sự nghiệp.' },
                { text: 'Cân bằng cuộc sống', icon: '🌿', hint: 'Sức khỏe +', effects: { health: 10, happiness: 10, stress: -8 }, result: 'Bạn có một nhịp sống bền vững hơn.' },
            ],
        },
        {
            id: 'ms_age_40',
            type: '🏁 Cột mốc',
            title: 'Tuổi 40 - tái định nghĩa thành công',
            description: 'Bạn đứng trước một lựa chọn quan trọng.',
            triggerAge: 40,
            oneTime: true,
            choices: [
                { text: 'Mở rộng ảnh hưởng', icon: '🌍', hint: 'Tiền + quan hệ +', effects: { money: 12, relationships: 10, stress: 7 }, result: 'Bạn mở rộng mạng lưới mạnh mẽ.' },
                { text: 'Tập trung cho bản thân', icon: '🧘', hint: 'Sức khỏe + hạnh phúc +', effects: { health: 12, happiness: 10, stress: -8 }, result: 'Bạn ưu tiên một cuộc sống an yên hơn.' },
            ],
        },
    ],
    passiveItems: [
        { id: 'item_course', name: '📘 Khóa học chuyên sâu', description: 'Mỗi năm tăng nhẹ kỹ năng.', cost: 20, category: 'growth', unlockAge: 23, effect: { skill: 2 } },
        { id: 'item_healthkit', name: '💊 Gói chăm sóc sức khỏe', description: 'Mỗi năm tăng sức khỏe nhẹ.', cost: 18, category: 'health', unlockAge: 23, effect: { health: 2 } },
        { id: 'item_network', name: '🤝 Câu lạc bộ kết nối', description: 'Mỗi năm tăng quan hệ xã hội.', cost: 20, category: 'social', unlockAge: 24, effect: { relationships: 2 } },
    ],
    activeSkills: [
        { id: 'skill_reset_stress', name: '🧘 Tái tạo tinh thần', description: 'Đặt lại stress về 0.', cost: 25, cooldown: 6, category: 'mind', unlockAge: 24, effect: 'reset_stress' },
        { id: 'skill_preview', name: '🔮 Nhìn trước tương lai', description: 'Xem trước sự kiện kế tiếp.', cost: 22, cooldown: 5, category: 'special', unlockAge: 24, effect: 'preview_choices' },
        { id: 'skill_boost_skill', name: '⚡ Bứt tốc học tập', description: 'Kỹ năng +20 và stress -10.', cost: 24, cooldown: 5, category: 'growth', unlockAge: 25, effect: 'boost_skill' },
        { id: 'skill_undo', name: '⏪ Quay về lựa chọn trước', description: 'Hoàn tác lựa chọn gần nhất.', cost: 30, cooldown: 7, category: 'special', unlockAge: 26, effect: 'undo_last_choice' },
    ],
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'rich_30',
        title: 'Triệu phú tuổi 30',
        emoji: '💎',
        description: 'Đạt tài chính 80 trước tuổi 30',
        condition: (s: Stats, engine: EngineRef) =>
            engine.state !== null && engine.state.age <= 30 && s.money >= 80,
    },
    {
        id: 'workaholic',
        title: 'Kẻ cuồng việc',
        emoji: '🧠',
        description: 'Đạt kỹ năng 90',
        condition: (s: Stats) => s.skill >= 90,
    },
]

export function getCareerLevel(
    careerId: string,
    skillLevel: number,
    careers: Record<string, Career>,
) {
    const career = careers[careerId]
    if (!career) return null
    let currentLevel = career.levels[0]
    for (const level of career.levels) {
        if (skillLevel >= level.minSkill) {
            currentLevel = level
        }
    }
    return currentLevel
}

// Singleton cache for lazy-loaded game data
let _cached: GameDataJson | null = null

function mergeById<T extends { id: string }>(base: T[], incoming: T[]): T[] {
    const map = new Map<string, T>()
    for (const item of base) map.set(item.id, item)
    for (const item of incoming) map.set(item.id, item)
    return Array.from(map.values())
}

function mergeGameData(raw: GameDataJson): GameDataJson {
    const mergedCareerEvents: Record<string, GameEvent[]> = {}
    const careerIds = new Set([
        ...Object.keys(FALLBACK_GAME_DATA.careerEvents || {}),
        ...Object.keys(raw.careerEvents || {}),
    ])

    const careerIdList = Array.from(careerIds)
    for (const careerId of careerIdList) {
        mergedCareerEvents[careerId] = mergeById(
            FALLBACK_GAME_DATA.careerEvents?.[careerId] || [],
            raw.careerEvents?.[careerId] || [],
        )
    }

    return {
        careers: {
            ...FALLBACK_GAME_DATA.careers,
            ...raw.careers,
        },
        commonEvents: mergeById(FALLBACK_GAME_DATA.commonEvents, raw.commonEvents || []),
        careerEvents: mergedCareerEvents,
        dangerousEvents: mergeById(FALLBACK_GAME_DATA.dangerousEvents, raw.dangerousEvents || []),
        milestoneEvents: mergeById(FALLBACK_GAME_DATA.milestoneEvents, raw.milestoneEvents || []),
        passiveItems: mergeById(FALLBACK_GAME_DATA.passiveItems, raw.passiveItems || []),
        activeSkills: mergeById(FALLBACK_GAME_DATA.activeSkills, raw.activeSkills || []),
    }
}

export async function loadGameData(): Promise<GameDataJson> {
    if (_cached) return _cached
    let raw: GameDataJson | null = null
    const candidatePaths = [
        '/nga-re-cuoc-doi/nga-re-cuoc-doi.json',
        '/nga-re-cuoc-doi.json',
        '/data/nga-re-cuoc-doi.json',
    ]

    for (const p of candidatePaths) {
        try {
            const res = await fetch(p)
            if (!res.ok) continue
            raw = (await res.json()) as GameDataJson
            break
        } catch {
            // Try next path
        }
    }

    raw = raw ? mergeGameData(raw) : FALLBACK_GAME_DATA

    // Patch events with condition functions that cannot be stored in JSON
    for (const evt of raw.dangerousEvents) {
        const cond = EVENT_CONDITIONS[evt.id]
        if (cond) evt.condition = cond
    }
    _cached = raw
    return raw
}