import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { getMyOrder, submitReview } from '../../services/api'
import CustomerPageHeader from './CustomerPageHeader'
import OrderSummaryCard from '../../components/ui/OrderSummaryCard'

export default function CustomerOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customer, loading: authLoading } = useCustomerAuth()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const load = () => {
    getMyOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!customer) {
      navigate('/login', { replace: true })
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, authLoading, id])

  const handleReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    if (rating < 1) {
      setReviewError('Please choose a star rating.')
      return
    }
    setSubmittingReview(true)
    try {
      await submitReview(id, rating, comment.trim() || null)
      load()
    } catch (err) {
      setReviewError(err.message || 'Could not submit your review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <CustomerPageHeader />
      <div className="max-w-lg mx-auto px-5 py-10">
        <Link to="/my-orders" className="inline-flex items-center gap-1.5 text-navy/60 text-sm font-semibold hover:text-navy">
          <ArrowLeft size={15} /> My Orders
        </Link>

        {loading && <p className="text-ink/50 text-sm mt-8">Loading…</p>}
        {error && <p className="text-red-600 text-sm mt-8">{error}</p>}

        {order && (
          <div className="mt-6">
            <OrderSummaryCard order={order}>
              {order.canReview && (
                <form onSubmit={handleReview} className="mt-6 pt-6 border-t border-navy/8">
                  <p className="font-display font-bold text-navy">How was your Protein Bae order?</p>
                  <div className="flex gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        className="p-0.5"
                      >
                        <Star
                          size={26}
                          className={(hoverRating || rating) >= n ? 'fill-yellow text-yellow' : 'text-navy/20'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you thought…"
                    className="w-full mt-3 rounded-xl border border-navy/15 px-4 py-3 text-sm focus:border-green outline-none resize-none"
                  />
                  {reviewError && <p className="text-red-600 text-sm mt-2">{reviewError}</p>}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="mt-3 bg-yellow text-navy-deep font-bold text-sm uppercase tracking-wide px-6 py-3 rounded-full hover:bg-yellow-deep transition-colors disabled:opacity-60"
                  >
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              )}

              {order.review && (
                <div className="mt-6 pt-6 border-t border-navy/8">
                  <p className="font-display font-bold text-navy text-sm mb-1.5">Your review</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} className={order.review.rating >= n ? 'fill-yellow text-yellow' : 'text-navy/15'} />
                    ))}
                  </div>
                  {order.review.comment && <p className="text-ink/60 text-sm mt-2">{order.review.comment}</p>}
                </div>
              )}
            </OrderSummaryCard>
          </div>
        )}
      </div>
    </div>
  )
}
