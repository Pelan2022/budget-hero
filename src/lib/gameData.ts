export type GoalDef = {
  id: string
  name: string
  emoji: string
  targetAmount: number
}

export type FuckupDef = {
  id: string
  name: string
  description: string
  effectType: 'one_time_cost' | 'savings_cost' | 'income_reduction' | 'optional_cost'
  effectValue: number
  isInsuranceProtected: boolean
}

export type ExpenseItemDef = {
  id: string
  name: string
  category: Category
  defaultAmount: number
  isFixed: boolean
  isInsurance: boolean
}

export const GOALS: GoalDef[] = [
  { id: 'phone', name: 'Nový telefon', emoji: '📱', targetAmount: 20000 },
  { id: 'vacation', name: 'Dovolená u moře', emoji: '🏖️', targetAmount: 100000 },
  { id: 'hoodie', name: 'Ta cool mikina', emoji: '👕', targetAmount: 3000 },
]

export const FUCKUPS: FuckupDef[] = [
  {
    id: 'flood',
    name: 'Vytopení bytu',
    description: 'Soused nahoře zapomněl zavřít kohoutek. Škoda 30 000 Kč — ale pojištění kryje vše.',
    effectType: 'one_time_cost',
    effectValue: 30000,
    isInsuranceProtected: true,
  },
  {
    id: 'washer',
    name: 'Rozbitá pračka',
    description: 'Pračka dosloužila. Nová stojí 15 000 Kč — musíš sáhnout do úspor.',
    effectType: 'savings_cost',
    effectValue: 15000,
    isInsuranceProtected: false,
  },
  {
    id: 'illness',
    name: 'Nemoc v rodině',
    description: 'Rodič byl měsíc v pracovní neschopnosti. Příjmy jsou jen 50 % po celý tento měsíc.',
    effectType: 'income_reduction',
    effectValue: 0.5,
    isInsuranceProtected: false,
  },
  {
    id: 'car',
    name: 'Rozbité auto',
    description: 'Auto potřebuje opravu za 20 000 Kč. Můžeš odložit a chodit pěšky, nebo hned zaplatit.',
    effectType: 'optional_cost',
    effectValue: 20000,
    isInsuranceProtected: false,
  },
  {
    id: 'camp',
    name: 'Sportovní soustředění',
    description: 'Nečekaná šance na soustředění — 5 000 Kč musíš zaplatit z úspor.',
    effectType: 'savings_cost',
    effectValue: 5000,
    isInsuranceProtected: false,
  },
]

export const CATEGORIES = ['BYDLENÍ', 'SPOTŘEBA', 'INVESTICE', 'SPOŘENÍ', 'ZÁBAVA'] as const
export type Category = typeof CATEGORIES[number]

export const CATEGORY_COLORS: Record<Category, string> = {
  'BYDLENÍ': '#5EB3FF',
  'SPOTŘEBA': '#FF9B3B',
  'INVESTICE': '#A855F7',
  'SPOŘENÍ': '#6DC030',
  'ZÁBAVA': '#FF6BA8',
}

export const CATEGORY_BG: Record<Category, string> = {
  'BYDLENÍ': '#DCF0FF',
  'SPOTŘEBA': '#FFF0DC',
  'INVESTICE': '#F3E8FF',
  'SPOŘENÍ': '#E5F9CC',
  'ZÁBAVA': '#FFE0F0',
}

export const CATEGORY_EMOJIS: Record<Category, string> = {
  'BYDLENÍ': '🏠',
  'SPOTŘEBA': '🛒',
  'INVESTICE': '📈',
  'SPOŘENÍ': '🐷',
  'ZÁBAVA': '🎮',
}

export const EXPENSE_ITEMS: ExpenseItemDef[] = [
  { id: 'water', name: 'Voda 🚰', category: 'BYDLENÍ', defaultAmount: 1200, isFixed: true, isInsurance: false },
  { id: 'electricity', name: 'Elektřina ⚡', category: 'BYDLENÍ', defaultAmount: 2000, isFixed: true, isInsurance: false },
  { id: 'rent', name: 'Nájem / hypotéka 🏠', category: 'BYDLENÍ', defaultAmount: 12000, isFixed: true, isInsurance: false },
  { id: 'internet', name: 'Internet 📶', category: 'BYDLENÍ', defaultAmount: 600, isFixed: true, isInsurance: false },
  { id: 'streaming', name: 'Streaming (Netflix, Spotify…) 📺', category: 'BYDLENÍ', defaultAmount: 500, isFixed: false, isInsurance: false },
  { id: 'groceries', name: 'Potraviny 🧺', category: 'SPOTŘEBA', defaultAmount: 8000, isFixed: true, isInsurance: false },
  { id: 'restaurant', name: 'Restaurace & kavárna ☕', category: 'SPOTŘEBA', defaultAmount: 2000, isFixed: false, isInsurance: false },
  { id: 'fastfood', name: 'Fast food 🍔', category: 'SPOTŘEBA', defaultAmount: 800, isFixed: false, isInsurance: false },
  { id: 'clothes', name: 'Oblečení 👗', category: 'SPOTŘEBA', defaultAmount: 1500, isFixed: false, isInsurance: false },
  { id: 'courses', name: 'Kurzy 📚', category: 'INVESTICE', defaultAmount: 1000, isFixed: false, isInsurance: false },
  { id: 'activities', name: 'Kroužky 🎨', category: 'INVESTICE', defaultAmount: 1500, isFixed: false, isInsurance: false },
  { id: 'savings', name: 'Úspory 🐷', category: 'SPOŘENÍ', defaultAmount: 2000, isFixed: false, isInsurance: false },
  { id: 'fund', name: 'Investiční fond 📈', category: 'SPOŘENÍ', defaultAmount: 1000, isFixed: false, isInsurance: false },
  { id: 'insurance', name: 'Pojištění', category: 'SPOŘENÍ', defaultAmount: 800, isFixed: false, isInsurance: true },
  { id: 'electronics', name: 'Nová elektronika 💻', category: 'SPOŘENÍ', defaultAmount: 1000, isFixed: false, isInsurance: false },
  { id: 'trips', name: 'Výlety 🗺️', category: 'SPOŘENÍ', defaultAmount: 2000, isFixed: false, isInsurance: false },
  { id: 'games', name: 'Hry & tokeny 🎮', category: 'ZÁBAVA', defaultAmount: 500, isFixed: false, isInsurance: false },
  { id: 'friends', name: 'Čas s kamarády 🎉', category: 'ZÁBAVA', defaultAmount: 1000, isFixed: false, isInsurance: false },
]
