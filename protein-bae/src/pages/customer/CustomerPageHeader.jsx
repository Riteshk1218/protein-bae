import { Link } from 'react-router-dom'
import logoMark from '../../assets/logo-mark.png'

export default function CustomerPageHeader() {
  return (
    <header className="bg-white border-b border-navy/8">
      <div className="max-w-lg mx-auto px-5 h-20 flex items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoMark} alt="Protein Bae" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display font-bold text-navy">Protein Bae</span>
        </Link>
      </div>
    </header>
  )
}
