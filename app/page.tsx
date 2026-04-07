'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    Home, ArrowLeft, PlayCircle, FolderOpen, Library, Trash2,
    ShoppingCart, Backpack, Menu, Save, RefreshCw, CheckCircle, Lock,
    TrendingUp, TrendingDown, BookOpen, GraduationCap, Briefcase, 
    Shuffle, Trophy, User, Check, Rocket, Sparkles, Building, BriefcaseMedical, 
    Palette, Utensils, Music, Laptop, DollarSign, Heart, Smile, Frown, Users,
    Activity, Cross, Skull, AlertTriangle, CloudRain, Star, Sunrise, Shield, Flame
} from 'lucide-react'

import {
    loadGameData,
    type GameDataJson,
    type GameState,
    type GameEvent,
    type Choice,
    type PassiveItem,
    type ActiveSkill,
} from './data'
import { GameEngine } from './engine'
import styles from './ngare.module.css'

type ScreenType = 'intro' | 'create' | 'game' | 'end'
type ToastInfo = { id: number; message: string; type: string }

const ALL_ENDINGS = [
    { id: 'vien_man', icon: Trophy, title: 'Cuộc Đời Viên Mãn', condition: 'Điểm tổng kết >= 350' },
    { id: 'thanh_cong', icon: Star, title: 'Cuộc Đời Thành Công', condition: 'Điểm tổng kết >= 280' },
    { id: 'binh_di', icon: Sunrise, title: 'Cuộc Đời Bình Dị', condition: 'Điểm tổng kết >= 200' },
    { id: 'gap_ghenh', icon: CloudRain, title: 'Cuộc Đời Gập Ghềnh', condition: 'Điểm tổng kết >= 120' },
    { id: 'thu_thach', icon: Flame, title: 'Cuộc Đời Đầy Thử Thách', condition: 'Điểm tổng kết < 120' },
    { id: 'pha_san', icon: TrendingDown, title: 'Phá Sản', condition: 'Vỡ nợ, đánh mất tất cả sự nghiệp' },
    { id: 'benh_tat', icon: Activity, title: 'Đầu Hàng Tuổi Tác', condition: 'Mắc bệnh nan y' },
    { id: 'luc_bat_tong_tam', icon: Shield, title: 'Lực Bất Tòng Tâm', condition: 'Cày cuốc đến cạn sinh lực' },
    { id: 'hoan_toan_guc_nga', icon: Skull, title: 'Hoàn Toàn Gục Ngã', condition: 'Áp lực cuộc sống đánh gục' },
    { id: 'ket_thuc_dot_ngot', icon: AlertTriangle, title: 'Kết Thúc Đột Ngột', condition: 'Sự cố ngẫu nhiên' },
]

export default function NgaReCuocDoiPage() {
    const engineRef = useRef<GameEngine | null>(null)
    const toastSeqRef = useRef(0)
    if (!engineRef.current) engineRef.current = new GameEngine()
    const engine = engineRef.current

    const [currentScreen, setCurrentScreen] = useState<ScreenType>('intro')
    const [gameData, setGameData] = useState<GameDataJson | null>(null)
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null)
    
    const [charNameInput, setCharNameInput] = useState('')
    const [selectedCareerId, setSelectedCareerId] = useState('')
    
    const [isShopOpen, setIsShopOpen] = useState(false)
    const [isInventoryOpen, setIsInventoryOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [previewModalEvent, setPreviewModalEvent] = useState<GameEvent | null>(null)

    const [shopTab, setShopTab] = useState<'items' | 'skills'>('items')
    const [inventoryTab, setInventoryTab] = useState<'inventory' | 'skills'>('inventory')

    const [toasts, setToasts] = useState<ToastInfo[]>([])
    const [statChanges, setStatChanges] = useState<Record<string, number> | null>(null)
    const [unlockedEndings, setUnlockedEndings] = useState<string[]>([])
    
    const [hasSavedGame, setHasSavedGame] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isApplyingChoice, setIsApplyingChoice] = useState(false)

    useEffect(() => {
        loadGameData().then((d) => setGameData(d))
        setHasSavedGame(engine.hasSave())
    }, [engine])

    const showToast = (message: string, type = 'toast-info') => {
        toastSeqRef.current += 1
        const id = Date.now() * 1000 + toastSeqRef.current
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }

    const openGallery = () => {
        try {
            setUnlockedEndings(JSON.parse(localStorage.getItem('ngare_endings') || '[]'))
        } catch {
            setUnlockedEndings([])
        }
        setIsGalleryOpen(true)
    }

    const startNewGame = async () => {
        if (!charNameInput.trim()) return showToast('Vui lòng nhập tên!', 'toast-negative')
        if (!selectedCareerId) return showToast('Vui lòng chọn nghề!', 'toast-negative')

        const stateObj = await engine.newGame(charNameInput, selectedCareerId)
        setGameState(stateObj ? JSON.parse(JSON.stringify(stateObj)) : null)
        setCurrentEvent(engine.getNextEvent())
        setCurrentScreen('game')
        window.scrollTo({ top: 0, behavior: 'auto' })
    }

    const loadGame = async () => {
        await engine.ensureData()
        const state = engine.loadGame()
        if (state) {
            setGameState(JSON.parse(JSON.stringify(state)))
            setCurrentEvent(engine.getNextEvent())
            setCurrentScreen('game')
            showToast('Đã tải game!', 'toast-info')
            window.scrollTo({ top: 0, behavior: 'auto' })
        }
    }

    const saveGame = () => {
        if (engine.saveGame()) {
            showToast('Đã lưu game!', 'toast-info')
            setHasSavedGame(true)
        }
        setIsMenuOpen(false)
    }

    const deleteSaveGame = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dữ liệu game đã lưu?')) {
            engine.clearSave()
            setHasSavedGame(false)
            showToast('Đã xóa dữ liệu lưu!', 'toast-info')
        }
    }

    const restartGame = () => {
        if (window.confirm('Bạn có chắc muốn chơi lại từ đầu?')) {
            setCurrentScreen('intro')
            setGameState(null)
            setCurrentEvent(null)
            setCharNameInput('')
            setSelectedCareerId('')
            setIsMenuOpen(false)
        }
    }

    const goToHomeScreen = () => {
        setCurrentScreen('intro')
        setGameState(null)
        setCurrentEvent(null)
        setIsMenuOpen(false)
        setIsShopOpen(false)
        setIsInventoryOpen(false)
        setPreviewModalEvent(null)
    }

    const calculateEnding = () => {
        if (!gameState) return { id: 'unknown', icon: Skull, title: 'Game Over', subtitle: '' }
        
        if (gameState.gameOverInfo) {
            const info = gameState.gameOverInfo
            if (info.type === 'bankruptcy') return { id: 'pha_san', icon: TrendingDown, title: 'Phá Sản', subtitle: info.message || 'Bạn đã mất trắng sự nghiệp...' }
            if (info.type === 'disease') return { id: 'benh_tat', icon: Activity, title: 'Đầu Hàng Tuổi Tác', subtitle: info.message || 'Sức khỏe không cho phép bạn bước tiếp...' }
            if (info.reason === 'health') return { id: 'luc_bat_tong_tam', icon: Shield, title: 'Lực Bất Tòng Tâm', subtitle: info.message || 'Kiệt quệ sinh lực...' }
            if (info.reason === 'burnout') return { id: 'hoan_toan_guc_nga', icon: Skull, title: 'Hoàn Toàn Gục Ngã', subtitle: info.message || 'Áp lực đánh gục bạn...' }
            if (info.reason && info.reason !== 'age') return { id: 'ket_thuc_dot_ngot', icon: AlertTriangle, title: 'Kết Thúc Đột Ngột', subtitle: info.message }
            if (info.type) return { id: 'ket_thuc_dot_ngot', icon: AlertTriangle, title: 'Kết Thúc', subtitle: info.message }
        }

        const s = gameState.stats
        const total = s.money + s.skill + s.happiness + s.health + s.relationships - s.stress
        if (total >= 350) return { id: 'vien_man', icon: Trophy, title: 'Cuộc Đời Viên Mãn', subtitle: 'Một cuộc đời trọn vẹn và hạnh phúc!' }
        if (total >= 280) return { id: 'thanh_cong', icon: Star, title: 'Cuộc Đời Thành Công', subtitle: 'Bạn đạt được nhiều thành tựu tự hào!' }
        if (total >= 200) return { id: 'binh_di', icon: Sunrise, title: 'Cuộc Đời Bình Dị', subtitle: 'Bình thường nhưng ý nghĩa theo cách riêng.' }
        if (total >= 120) return { id: 'gap_ghenh', icon: CloudRain, title: 'Cuộc Đời Gập Ghềnh', subtitle: 'Nhiều khó khăn nhưng bạn vẫn vượt qua.' }
        return { id: 'thu_thach', icon: Flame, title: 'Cuộc Đời Đầy Thử Thách', subtitle: 'Cuộc sống không dễ dàng, nhưng bạn đã cố gắng.' }
    }

    const handleChoice = (choice: Choice) => {
        if (isApplyingChoice) return
        setIsApplyingChoice(true)

        const oldStats = gameState ? { ...gameState.stats } : null
        const result = engine.applyChoice(choice)
        
        const newState = JSON.parse(JSON.stringify(engine.state))
        setGameState(newState)

        if (oldStats && newState) {
            const newStats = newState.stats
            for (const key in newStats) {
                const val = newStats[key]
                const oldVal = oldStats[key]
                if (key === 'stress' && val >= 100 && oldVal < 100) {
                    showToast('Nguy hiểm! Mức độ căng thẳng đã quá tải.', 'toast-negative')
                } else if (key === 'health' && val <= 20 && oldVal > 20) {
                    showToast('Cảnh báo! Sức khỏe đang ở mức báo động.', 'toast-negative')
                } else if (key !== 'stress' && val >= 100 && oldVal < 100) {
                    showToast(`Tuyệt vời! ${getStatName(key)} đạt mức tối đa.`, 'toast-positive')
                }
            }
        }

        if (result.effects && Object.keys(result.effects).length > 0) {
            setStatChanges(result.effects as Record<string, number>)
            setTimeout(() => setStatChanges(null), 2500)
        }

        if (result.gameOver) {
            if ((result.gameOver as any)?.message) {
                showToast((result.gameOver as any).message, 'toast-negative')
            }
            setCurrentScreen('end')
            
            // Wait for state to properly register before calculating ending saving
            setTimeout(() => {
                const endResult = calculateEnding()
                if (endResult && endResult.id && endResult.id !== 'unknown') {
                    let unlocked = []
                    try { unlocked = JSON.parse(localStorage.getItem('ngare_endings') || '[]') } catch {}
                    if (!unlocked.includes(endResult.id)) {
                        unlocked.push(endResult.id)
                        localStorage.setItem('ngare_endings', JSON.stringify(unlocked))
                        setTimeout(() => showToast(`Mở khóa cái kết mới: ${endResult.title}`, 'toast-positive'), 1000)
                    }
                }
            }, 100)
        } else {
            setCurrentEvent(engine.getNextEvent())
        }

        setTimeout(() => setIsApplyingChoice(false), 150)
    }

    const buyItemFn = async (item: PassiveItem) => {
        const result = await engine.buyItem(item.id)
        setGameState(JSON.parse(JSON.stringify(engine.state)))
        showToast(result.message, result.success ? 'toast-positive' : 'toast-negative')
    }

    const buySkillFn = async (skill: ActiveSkill) => {
        const result = await engine.buySkill(skill.id)
        setGameState(JSON.parse(JSON.stringify(engine.state)))
        showToast(result.message, result.success ? 'toast-positive' : 'toast-negative')
    }

    const useSkillFn = async (skillId: string) => {
        const result = await engine.useSkill(skillId)
        if (result.success) {
            showToast(result.message || 'Kích hoạt kỹ năng thành công', 'toast-positive')
            if ('isPreview' in result && result.isPreview && 'previewEvent' in result && result.previewEvent) {
                setPreviewModalEvent(result.previewEvent as GameEvent)
            } else {
                setGameState(JSON.parse(JSON.stringify(engine.state)))
                setCurrentEvent(engine.getNextEvent())
            }
        } else {
            showToast(result.message || 'Không thể sử dụng kỹ năng', 'toast-negative')
        }
    }

    const getStatIcon = (stat: string) => {
        switch (stat) {
            case 'money': return <DollarSign size={18} />
            case 'skill': return <Sparkles size={18} />
            case 'happiness': return <Smile size={18} />
            case 'stress': return <Frown size={18} />
            case 'health': return <Heart size={18} />
            case 'relationships': return <Users size={18} />
            default: return <TrendingUp size={18} />
        }
    }
    const getStatName = (stat: string) => {
        const map: Record<string, string> = { money: 'Tài chính', skill: 'Kỹ năng', happiness: 'Hạnh phúc', stress: 'Căng thẳng', health: 'Sức khỏe', relationships: 'Quan hệ' }
        return map[stat] || stat
    }

    const canBuyItem = (item: PassiveItem) => ((gameState?.stats?.money ?? 0) >= item.cost && !(gameState?.inventory ?? []).includes(item.id))
    const canBuySkill = (skill: ActiveSkill) => ((gameState?.stats?.money ?? 0) >= skill.cost && !(gameState?.activeSkills ?? []).includes(skill.id))

    const getIconForCareer = (emoji: string) => {
        switch (emoji) {
            case '🎓': return <GraduationCap size={28} strokeWidth={1.5} />
            case '💼': return <Briefcase size={28} strokeWidth={1.5} />
            case '💻': return <Laptop size={28} strokeWidth={1.5} />
            case '🩺': return <Activity size={28} strokeWidth={1.5} />
            case '🎨': return <Palette size={28} strokeWidth={1.5} />
            case '🍳': return <Utensils size={28} strokeWidth={1.5} />
            case '🎤': return <Music size={28} strokeWidth={1.5} />
            case '🏢': return <Building size={28} strokeWidth={1.5} />
            case '💰': return <DollarSign size={28} strokeWidth={1.5} />
            default: return <Sparkles size={28} strokeWidth={1.5} />
        }
    }

    const toPlainLabel = (text: string) => {
        const trimmed = text.trim()
        const firstSpace = trimmed.indexOf(' ')
        if (firstSpace > 0) {
            const firstToken = trimmed.slice(0, firstSpace)
            if (!/[A-Za-z0-9À-ỹ]/.test(firstToken)) {
                return trimmed.slice(firstSpace + 1).trim()
            }
        }
        return trimmed
    }

    const getItemIcon = (item: PassiveItem) => {
        if (item.category === 'health') return <Heart size={22} />
        if (item.category === 'social') return <Users size={22} />
        if (item.category === 'growth') return <Sparkles size={22} />
        return <Backpack size={22} />
    }

    const getSkillIcon = (skill: ActiveSkill) => {
        if (skill.effect === 'preview_choices') return <BookOpen size={22} />
        if (skill.effect === 'reset_stress') return <Heart size={22} />
        if (skill.effect === 'undo_last_choice') return <RefreshCw size={22} />
        return <Sparkles size={22} />
    }

    const getMilestoneInfo = (text: string) => {
        const t = text.toLowerCase()
        if (t.includes('thăng tiến') || t.includes('thăng chức')) return { is: true, type: 'career', icon: <Rocket size={16}/>, color: '#8b5cf6' }
        if (t.includes('tốt nghiệp')) return { is: true, type: 'success', icon: <GraduationCap size={16}/>, color: '#3b82f6' }
        if (t.includes('kết hôn') || t.includes('người đặc biệt')) return { is: true, type: 'life', icon: <Heart size={16}/>, color: '#ec4899' }
        if (t.includes('mua') || t.includes('đầu tư')) return { is: true, type: 'success', icon: <DollarSign size={16}/>, color: '#f59e0b' }
        if (t.includes('thành tựu')) return { is: true, type: 'special', icon: <Trophy size={16}/>, color: '#10b981' }
        return { is: false, type: '', icon: <Star size={16}/>, color: '' }
    }

    // Tốc độ update Timeline React array
    const historyEntries = gameState?.history ? [...gameState.history].reverse() : []

    const BackgroundDecorations = () => (
        <div className={styles.particlesCanvas}></div>
    )

    return (
        <div className={styles.ngareWrapper}>
            <BackgroundDecorations />

            {/* GLOBAL NAV */}
            {(currentScreen === 'intro' || currentScreen === 'create') && (
                <div className={styles.globalNav}>
                    <Link href="/" className={styles.btnHome} title="Về trang chủ">
                        <Home size={20} />
                    </Link>
                    {currentScreen === 'create' && (
                        <button className={styles.btnBackScreen} onClick={() => setCurrentScreen('intro')} title="Quay lại">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                </div>
            )}

            {/* INTRO */}
            {currentScreen === 'intro' && (
                <div className={`${styles.screen} ${styles.active}`}>
                    <div className={styles.introContainer}>
                        <div className={styles.introLogo}>
                            <span className={styles.logoIcon}><Shuffle size={64} strokeWidth={2.2} /></span>
                            <h1 className={styles.introTitle}>Vạn Biến<span className={styles.highlight}>Cuộc Đời</span></h1>
                        </div>
                        <p className={styles.introSubtitle}>Viết nên câu chuyện của riêng bạn qua từng quyết định. Cuộc sống là một cuộc hành trình vạn biến.</p>
                        
                        <div className={styles.introFeatures}>
                            <div className={styles.featureTag}><GraduationCap size={18}/> Tốt nghiệp đại học</div>
                            <div className={styles.featureTag}><Briefcase size={18}/> Chọn sự nghiệp</div>
                            <div className={styles.featureTag}><Shuffle size={18}/> Đối mặt ngã rẽ</div>
                            <div className={styles.featureTag}><Trophy size={18}/> Viết nên cuộc đời</div>
                        </div>

                        <div className={styles.introActions}>
                            <button
                                className={`${styles.btnBase} ${styles.btnPrimary}`}
                                disabled={!gameData}
                                onClick={() => setCurrentScreen('create')}
                            >
                                <PlayCircle size={22} />
                                {gameData ? 'Bắt Đầu Hành Trình' : 'Đang tải dữ liệu...'}
                            </button>
                            <div className={styles.actionsRow}>
                                {hasSavedGame && (
                                    <button className={`${styles.btnBase} ${styles.btnSecondary}`} onClick={loadGame}>
                                        <FolderOpen size={18} /> Tiếp Tục Game
                                    </button>
                                )}
                                <button className={`${styles.btnBase} ${styles.btnSecondary}`} onClick={openGallery}>
                                    <Library size={18} /> Bộ Sưu Tập Kết Cục
                                </button>
                                {hasSavedGame && (
                                    <button className={`${styles.btnBase} ${styles.btnDanger}`} onClick={deleteSaveGame}>
                                        <Trash2 size={18} /> Xóa Dữ Liệu
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE DYNAMIC DESIGN */}
            {currentScreen === 'create' && (
                <div className={`${styles.screen} ${styles.active}`}>
                    <div className={styles.destinyContainer}>
                        <div className={styles.destinyHeader}>
                            <h2 className={styles.destinyTitle}>Định Hình <span className={styles.highlight}>Số Phận</span></h2>
                            <p className={styles.destinySubtitle}>Chọn phong cách sống bạn muốn theo đuổi. Mỗi nghề có nhịp phát triển và thử thách rất khác nhau.</p>
                            <div className={styles.destinyMeta}>
                                {gameData ? `${Object.keys(gameData.careers).length} nghề để lựa chọn` : 'Đang nạp danh sách nghề...'}
                            </div>
                            
                            <div className={styles.destinyInputGroup}>
                                <User className={styles.diIcon} />
                                <input
                                    className={styles.destinyInput}
                                    value={charNameInput}
                                    onChange={e => setCharNameInput(e.target.value)}
                                    placeholder="Điền tên nhân vật của bạn..."
                                    maxLength={20}
                                    onKeyDown={e => e.key === 'Enter' && charNameInput && selectedCareerId && startNewGame()}
                                />
                            </div>
                        </div>

                        <div className={styles.destinyCardsContainer}>
                            {!gameData && (
                                <div className={styles.loadingState}>
                                    <div className={styles.loadingSpinner}></div>
                                    <p>Đang tải dữ liệu nghề nghiệp...</p>
                                </div>
                            )}
                            <div className={styles.destinyCardsTrack}>
                                {gameData && Object.entries(gameData.careers).map(([id, career]) => {
                                    const isSelected = selectedCareerId === id;
                                    return (
                                        <div 
                                            key={id} 
                                            className={`${styles.destinyCard} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => setSelectedCareerId(id)}
                                        >
                                            <div className={styles.dcGlow}></div>
                                            <div className={styles.dcIconWrapper}>
                                                {getIconForCareer(career.emoji)}
                                            </div>
                                            <h3 className={styles.dcName}>{career.name}</h3>
                                            
                                            <div className={styles.dcDetails}>
                                                <p className={styles.dcDesc}>{career.description}</p>
                                                <div className={styles.dcStats}>
                                                    {Object.entries(career.startStats).map(([key, val]) => (
                                                        <div key={key} className={styles.dcStatBadge} title={getStatName(key)}>
                                                            {getStatIcon(key)}
                                                            <span>{val}</span>
                                                            <small>{getStatName(key)}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className={styles.destinyFooter}>
                            <button 
                                className={`${styles.btnDestinyStart} ${charNameInput && selectedCareerId ? styles.ready : ''}`}
                                disabled={!charNameInput || !selectedCareerId || !gameData}
                                onClick={startNewGame}
                            >
                                <PlayCircle size={24} /> Bắt Đầu Cuộc Đời
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GAME */}
            {currentScreen === 'game' && gameState && (
                <div className={`${styles.screen} ${styles.screenGame}`}>
                    <div className={styles.gameLayout}>
                        <header className={styles.gameHeader}>
                            <div className={styles.headerLeft}>
                                <Link href="/" className={`${styles.btnIcon} ${styles.btnIconHome}`}>
                                    <Home size={20} />
                                </Link>
                                <div className={styles.playerInfo}>
                                    <span className={styles.playerName}>{gameState.name}</span>
                                    <span className={styles.playerCareer}>{gameState.careerEmoji} {gameState.currentLevel}</span>
                                </div>
                            </div>
                            
                            <div className={styles.headerCenter}>
                                <div className={styles.ageDisplay}>
                                    <span className={styles.ageLabel}>Tuổi</span>
                                    <span className={styles.ageValue}>{gameState.age}</span>
                                </div>
                                <div className={styles.yearDisplay}>
                                    <span className={styles.yearLabel}>Năm</span>
                                    <span className={styles.yearValue}>{gameState.year}</span>
                                </div>
                            </div>

                            <div className={styles.headerRight}>
                                <button className={styles.btnIcon} onClick={() => setIsShopOpen(true)} title="Cửa hàng"><ShoppingCart size={20} /></button>
                                <button className={styles.btnIcon} onClick={() => setIsInventoryOpen(true)} title="Túi đồ"><Backpack size={20} /></button>
                                <button className={`${styles.btnIcon} ${!isSidebarCollapsed ? styles.btnIconActive : ''}`} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title="Nhật ký">
                                    <BookOpen size={20} />
                                </button>
                                <button className={styles.btnIcon} onClick={saveGame} title="Lưu game"><Save size={20} /></button>
                                <button className={styles.btnIcon} onClick={() => setIsMenuOpen(true)} title="Menu"><Menu size={20} /></button>
                            </div>
                        </header>

                        <div className={styles.gameMainSplit}>
                            <div className={styles.gameLeftColumn}>
                                <div className={styles.statsPanel}>
                                    {Object.entries(gameState.stats).map(([stat, val]) => (
                                        <div key={stat} className={`${styles.statItem} ${
                                            (stat === 'stress' && val >= 80) || (stat === 'health' && val <= 20) ? styles.statWarning : 
                                            (stat !== 'stress' && val >= 100 ? styles.statPositive : '')
                                        }`}>
                                            <div className={styles.statHeader}>
                                                <span className={styles.statIcon}>{getStatIcon(stat)}</span>
                                                <span className={styles.statName}>{getStatName(stat)}</span>
                                                <span className={styles.statValue}>{val}</span>
                                            </div>
                                            <div className={styles.statBar}>
                                                <div className={styles.statFill} style={{ width: `${val}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.eventArea}>
                                    {currentEvent && (
                                        <div className={styles.eventCard}>
                                            <div className={styles.eventType}>{toPlainLabel(currentEvent.type)}</div>
                                            <h3 className={styles.eventTitle}>{currentEvent.title}</h3>
                                            <p className={styles.eventDesc}>{currentEvent.description}</p>
                                            
                                            <div className={styles.eventChoices}>
                                                {currentEvent.choices.map((choice, idx) => (
                                                    <button
                                                        key={idx}
                                                        className={styles.choiceBtn}
                                                        disabled={isApplyingChoice}
                                                        onClick={() => handleChoice(choice)}
                                                    >
                                                        <span className={styles.choiceIcon}><CheckCircle size={22}/></span>
                                                        <div className={styles.choiceText}>
                                                            {choice.text}
                                                            {choice.hint && <span className={styles.choiceHint}>{choice.hint}</span>}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <aside className={`${styles.gameTimelineSidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
                                <div className={styles.timelinePanel}>
                                    <h3 className={styles.timelineTitle}>Nhật ký cuộc đời</h3>
                                    <div className={styles.timelineList}>
                                        {historyEntries.map((entry, idx) => {
                                            const info = getMilestoneInfo(entry.text)
                                            return (
                                                <div key={idx} className={`${styles.timelineEntry} ${info.is ? styles.milestoneEntry : ''}`} style={info.is ? { '--ms-color': info.color } as any : {}}>
                                                    <span className={styles.timelineYear}>{entry.age}t</span>
                                                    <span className={styles.timelineDot}></span>
                                                    <div className={styles.timelineContent}>
                                                        {info.is && <span className={styles.msIcon}>{info.icon}</span>}
                                                        <span className={styles.timelineText}>{entry.text}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            )}

            {/* END */}
            {currentScreen === 'end' && (
                <div className={`${styles.screen} ${styles.active}`}>
                    <div className={styles.endContainer}>
                        <div className={styles.endIconWrapper}>
                            {(() => { const EndingIcon = calculateEnding().icon; return <EndingIcon size={64}/> })()}
                        </div>
                        <h2 className={styles.endTitle}>{calculateEnding().title}</h2>
                        <p className={styles.endSubtitle}>{calculateEnding().subtitle}</p>
                        
                        {gameState && (
                            <div className={styles.endStats}>
                                {Object.entries(gameState.stats).map(([stat, val]) => (
                                    <div key={stat} className={styles.endStatCard}>
                                        <span className={styles.esIcon}>{getStatIcon(stat)}</span>
                                        <span className={styles.esValue}>{val}</span>
                                        <span className={styles.esLabel}>{getStatName(stat)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className={styles.endActions}>
                            <button className={`${styles.btnBase} ${styles.btnPrimary}`} onClick={restartGame}>
                                <RefreshCw size={20} /> Chơi Lại
                            </button>
                            <button className={`${styles.btnBase} ${styles.btnSecondary}`} onClick={goToHomeScreen}>
                                <Home size={20} /> Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SHOP MODAL */}
            {isShopOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsShopOpen(false) }}>
                    <div className={`${styles.modalContent} ${styles.modalLarge}`}>
                        <h3>Cửa Hàng</h3>
                        <div className={styles.shopTabs}>
                            <button className={`${styles.shopTab} ${shopTab === 'items' ? styles.active : ''}`} onClick={() => setShopTab('items')}>Vật Phẩm</button>
                            <button className={`${styles.shopTab} ${shopTab === 'skills' ? styles.active : ''}`} onClick={() => setShopTab('skills')}>Kỹ Năng</button>
                        </div>
                        <div className={styles.shopContent}>
                            {shopTab === 'items' && gameData?.passiveItems.map(item => (
                                <div key={item.id} className={styles.shopItem}>
                                    <div className={styles.shopItemIcon}>{getItemIcon(item)}</div>
                                    <div className={styles.shopItemInfo}>
                                        <div className={styles.shopItemHeader}>
                                            <span className={styles.shopItemName}>{toPlainLabel(item.name)}</span>
                                            <span className={styles.shopItemPrice}>{item.cost}</span>
                                        </div>
                                        <div className={styles.shopItemDesc}>{item.description}</div>
                                        <button className={styles.btnBuy} disabled={!canBuyItem(item)} onClick={() => buyItemFn(item)}>
                                            {(gameState?.inventory || []).includes(item.id) ? 'Đã có' : 'Mua'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {shopTab === 'skills' && gameData?.activeSkills.map(skill => (
                                <div key={skill.id} className={styles.shopItem}>
                                    <div className={styles.shopItemIcon}>{getSkillIcon(skill)}</div>
                                    <div className={styles.shopItemInfo}>
                                        <div className={styles.shopItemHeader}>
                                            <span className={styles.shopItemName}>{toPlainLabel(skill.name)}</span>
                                            <span className={styles.shopItemPrice}>{skill.cost}</span>
                                        </div>
                                        <div className={styles.shopItemDesc}>{skill.description}</div>
                                        <button className={styles.btnBuy} disabled={!canBuySkill(skill)} onClick={() => buySkillFn(skill)}>
                                            {(gameState?.activeSkills || []).includes(skill.id) ? 'Đã học' : 'Mở khóa'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={`${styles.modalBtn} ${styles.modalClose}`} onClick={() => setIsShopOpen(false)}>✕ Đóng</button>
                    </div>
                </div>
            )}

            {/* INVENTORY MODAL */}
            {isInventoryOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsInventoryOpen(false) }}>
                    <div className={`${styles.modalContent} ${styles.modalLarge}`}>
                        <h3>Túi Đồ</h3>
                        <div className={styles.shopTabs}>
                            <button className={`${styles.shopTab} ${inventoryTab === 'inventory' ? styles.active : ''}`} onClick={() => setInventoryTab('inventory')}>Vật Phẩm</button>
                            <button className={`${styles.shopTab} ${inventoryTab === 'skills' ? styles.active : ''}`} onClick={() => setInventoryTab('skills')}>Kỹ Năng</button>
                        </div>
                        <div className={styles.shopContent}>
                            {inventoryTab === 'inventory' && (
                                <>
                                    {!gameState?.inventory?.length && (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyStateIcon}><Backpack size={44} /></div>
                                            Chưa có vật phẩm nào
                                        </div>
                                    )}
                                    {gameState?.inventory?.map(id => {
                                        const item = gameData?.passiveItems.find(i => i.id === id)
                                        return item ? (
                                            <div key={id} className={styles.shopItem}>
                                                <div className={styles.shopItemIcon}>{getItemIcon(item)}</div>
                                                <div className={styles.shopItemInfo}>
                                                    <div className={styles.shopItemName}>{toPlainLabel(item.name)}</div>
                                                    <div className={styles.shopItemDesc}>{item.description}</div>
                                                </div>
                                            </div>
                                        ) : null
                                    })}
                                </>
                            )}
                            {inventoryTab === 'skills' && (
                                <>
                                    {!gameState?.activeSkills?.length && (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyStateIcon}><Sparkles size={44} /></div>
                                            Chưa có kỹ năng nào
                                        </div>
                                    )}
                                    {gameState?.activeSkills?.map(id => {
                                        const skill = gameData?.activeSkills.find(s => s.id === id)
                                        const cooldown = gameState?.skillCooldowns?.[id] || 0
                                        return skill ? (
                                            <div key={id} className={styles.shopItem}>
                                                <div className={styles.shopItemIcon}>{getSkillIcon(skill)}</div>
                                                <div className={styles.shopItemInfo}>
                                                    <div className={styles.shopItemHeader}>
                                                        <span className={styles.shopItemName}>{toPlainLabel(skill.name)}</span>
                                                        <span style={{ fontWeight: 600, color: cooldown ? '#ef4444' : '#10b981' }}>
                                                            {cooldown ? `Còn ${cooldown} năm` : 'Sẵn sàng'}
                                                        </span>
                                                    </div>
                                                    <button className={styles.btnUse} disabled={!!cooldown} onClick={() => useSkillFn(id)}>
                                                        {cooldown ? 'Chưa sẵn sàng' : 'Sử dụng'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : null
                                    })}
                                </>
                            )}
                        </div>
                        <button className={`${styles.modalBtn} ${styles.modalClose}`} onClick={() => setIsInventoryOpen(false)}>✕ Đóng</button>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {previewModalEvent && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setPreviewModalEvent(null) }}>
                    <div className={styles.modalContent}>
                        <h3>Nhìn Trước Tương Lai</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Năm {gameState?.year! + 1} | Tuổi {gameState?.age! + 1}</p>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                            <div className={styles.eventType}>{toPlainLabel(previewModalEvent.type)}</div>
                            <h4 style={{ fontSize: '1.4rem', margin: '0.5rem 0' }}>{previewModalEvent.title}</h4>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{previewModalEvent.description}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {previewModalEvent.choices.map((choice, idx) => (
                                    <div key={idx} style={{ padding: '0.8rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                                        <strong>{choice.text}</strong>
                                        {choice.hint && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{choice.hint}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className={styles.modalBtn} onClick={() => setPreviewModalEvent(null)}>Đã hiểu</button>
                    </div>
                </div>
            )}

            {/* GALLERY MODAL */}
            {isGalleryOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsGalleryOpen(false) }}>
                    <div className={`${styles.modalContent} ${styles.modalLarge}`}>
                        <h3>Bộ Sưu Tập</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Mở khóa: {unlockedEndings.length}/{ALL_ENDINGS.length}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', maxHeight: '50vh', overflowY: 'auto' }}>
                            {ALL_ENDINGS.map(ending => {
                                const isUnlocked = unlockedEndings.includes(ending.id)
                                const EndingIcon = ending.icon
                                return (
                                    <div key={ending.id} style={{ padding: '1rem', background: isUnlocked ? 'var(--bg-secondary)' : 'var(--bg-primary)', opacity: isUnlocked ? 1 : 0.6, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display:'flex', justifyContent:'center', marginBottom:'1rem', color: isUnlocked ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                                            {isUnlocked ? <EndingIcon size={40}/> : <Lock size={40}/>}
                                        </div>
                                        <h4 style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-primary)' }}>{isUnlocked ? ending.title : '???'}</h4>
                                        <p style={{ fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{ending.condition}</p>
                                    </div>
                                )
                            })}
                        </div>
                        <button className={`${styles.modalBtn} ${styles.modalClose}`} onClick={() => setIsGalleryOpen(false)}>✕ Đóng</button>
                    </div>
                </div>
            )}

            {/* MENU MODAL */}
            {isMenuOpen && (
                <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsMenuOpen(false) }}>
                    <div className={styles.modalContent}>
                        <h3>Menu</h3>
                        <button className={styles.modalBtn} onClick={saveGame}><Save size={18} style={{ display:'inline', verticalAlign:'middle', marginRight:8 }}/> Lưu Game</button>
                        <button className={styles.modalBtn} onClick={restartGame}><RefreshCw size={18} style={{ display:'inline', verticalAlign:'middle', marginRight:8 }}/> Chơi Lại</button>
                        <button className={styles.modalBtn} onClick={goToHomeScreen}><Home size={18} style={{ display:'inline', verticalAlign:'middle', marginRight:8 }}/> Về Trang Chủ</button>
                        <button className={`${styles.modalBtn} ${styles.modalClose}`} onClick={() => setIsMenuOpen(false)}>✕ Đóng</button>
                    </div>
                </div>
            )}

            {/* TOASTS */}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
                        {toast.message}
                    </div>
                ))}
            </div>

            {/* STAT CHANGE POPUPS */}
            {statChanges && (
                <div className={styles.statChangePopup}>
                    {Object.entries(statChanges).map(([key, val]) => (
                        <div key={key} className={`${styles.statDiff} ${(key === 'stress' ? val < 0 : val > 0) ? styles.positive : styles.negative}`}>
                            <span>{getStatIcon(key)}</span>
                            <span>{val > 0 ? '+' : ''}{val}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
