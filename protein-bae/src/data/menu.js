// Placeholder menu data. Nutrition and pricing values are illustrative,
// not real claims. Once the menu-management API exists, this file is
// replaced by a fetch through src/services/api.js#getMenu().
export const menuItems = [
  {
    id: 'protein-salad-bowl',
    name: 'Protein Salad Bowl',
    description:
      'Fresh greens, colorful vegetables and delicious protein-packed ingredients in one satisfying bowl.',
    art: 'salad',
    protein: 28,
    calories: 420,
    price: 249,
    available: true,
  },
  {
    id: 'protein-meal-bowl',
    name: 'Protein Meal Bowl',
    description:
      'A balanced, filling meal designed for people who want great taste with better protein.',
    art: 'grain',
    protein: 34,
    calories: 520,
    price: 289,
    available: true,
  },
  {
    id: 'protein-wrap',
    name: 'Protein Wrap',
    description:
      'Fresh, flavorful and packed into a convenient wrap made for eating on the go.',
    art: 'wrap',
    protein: 26,
    calories: 380,
    price: 219,
    available: true,
  },
  {
    id: 'protein-shake',
    name: 'Protein Shake',
    description:
      'A smooth, delicious protein shake for a quick and convenient protein boost.',
    art: 'shake',
    protein: 24,
    calories: 260,
    price: 179,
    available: true,
  },
]
