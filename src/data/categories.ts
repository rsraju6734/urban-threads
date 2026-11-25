import type { Category } from '../types/store'
import { photo } from './images'

export const categories: Category[] = [
  { id: 'tshirts', name: "Men's T-Shirts", label: ["Men's", 'T-Shirts'], image: photo('teeBlackModel', 700, 860), description: 'Heavyweight cotton essentials cut for a modern fit.' },
  { id: 'hoodies', name: 'Hoodies & Sweatshirts', label: ['Hoodies', '& Sweatshirts'], image: photo('hoodieWhiteModel', 700, 860), description: 'Brushed fleece layers built for everyday comfort.' },
  { id: 'pants', name: 'Pants & Jeans', label: ['Pants', '& Jeans'], image: photo('jeansStreet', 700, 860), description: 'Raw denim and tailored chinos with clean lines.' },
  { id: 'shirts', name: 'Shirts', label: ['Shirts'], image: photo('shirtWhiteModel', 700, 860), description: 'Crisp poplin, oxford and chambray shirting.' },
  { id: 'polos', name: 'Polos', label: ['Polos'], image: photo('polosFolded', 700, 860), description: 'Piqué cotton polos in a refined palette.' },
  { id: 'jackets', name: 'Jackets & Outerwear', label: ['Jackets', '& Outerwear'], image: photo('denimJacketModel', 700, 860), description: 'Statement outer layers from denim to leather.' },
]

export const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id
