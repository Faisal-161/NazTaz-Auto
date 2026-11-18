import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CartLineItem } from '@/components/cart/CartLineItem'
import type { ClientCartLine } from '@/lib/stores/cart'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

const line: ClientCartLine = {
  id: 'l1',
  merchandiseId: 'v1',
  productHandle: 'fd-dr-01-door-puddle-lights',
  title: 'Ford truck door puddle lights',
  variantTitle: '2 lights / Custom',
  unitPrice: { amount: '159.00', currencyCode: 'USD' },
  quantity: 2,
  image: { url: '/placeholders/product-night.svg', altText: '', width: 1200, height: 900 },
  attributes: [
    { key: '_vehicle', value: '2022 Ford F-150 XLT' },
    { key: '_housing_code', value: 'FD-DR-01' },
    { key: '_design_id', value: 'dsg_1' },
  ],
}

describe('CartLineItem', () => {
  it('shows vehicle, housing, line total and an edit-design link', () => {
    render(
      <ul>
        <CartLineItem line={line} onQuantity={() => {}} onRemove={() => {}} />
      </ul>,
    )
    expect(screen.getByText('2022 Ford F-150 XLT')).toBeInTheDocument()
    expect(screen.getByText('FD-DR-01')).toBeInTheDocument()
    expect(screen.getByText('$318')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit design/i })).toHaveAttribute(
      'href',
      '/studio?line=l1',
    )
  })

  it('quantity and remove buttons are keyboard operable with accessible names', async () => {
    const onQuantity = vi.fn()
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(
      <ul>
        <CartLineItem line={line} onQuantity={onQuantity} onRemove={onRemove} />
      </ul>,
    )
    screen.getByRole('button', { name: /increase quantity/i }).focus()
    await user.keyboard('{Enter}')
    expect(onQuantity).toHaveBeenCalledWith(3)
    await user.click(screen.getByRole('button', { name: /decrease quantity/i }))
    expect(onQuantity).toHaveBeenCalledWith(1)
    await user.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemove).toHaveBeenCalled()
  })
})
