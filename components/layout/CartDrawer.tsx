'use client'

import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetContent } from '@/components/ui/Sheet'
import { EmptyState } from '@/components/ui/States'
import { cartDrawer as t } from '@/content/layout'
import { cartSubtotal, useCartStore } from '@/lib/stores/cart'
import { toast } from '@/lib/stores/toast'
import { formatMoney } from '@/lib/utils'

export function CartDrawer() {
  const { lines, isOpen, setOpen, setQuantity, remove, add, close } = useCartStore()
  const subtotal = cartSubtotal(lines)

  function handleRemove(id: string) {
    const line = lines.find((l) => l.id === id)
    remove(id)
    if (line) {
      const { id: _id, ...rest } = line
      void _id
      toast({
        title: t.removed(line.title),
        action: { label: t.undo, altText: t.undoAlt(line.title), onClick: () => add(rest) },
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" title={t.title} closeLabel={t.close}>
        {lines.length === 0 ? (
          <EmptyState
            className="my-auto"
            icon={<ShoppingBag />}
            title={t.empty.title}
            body={t.empty.body}
            actions={
              <>
                <Button asChild onClick={close}>
                  <Link href="/fitment">{t.empty.cta}</Link>
                </Button>
                <Button asChild variant="secondary" onClick={close}>
                  <Link href="/shop">{t.empty.secondary}</Link>
                </Button>
              </>
            }
          />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
              {lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  onQuantity={(q) => (q <= 0 ? handleRemove(line.id) : setQuantity(line.id, q))}
                  onRemove={() => handleRemove(line.id)}
                  onNavigate={close}
                />
              ))}
            </ul>
            <div className="border-t border-line px-5 pt-4 pb-5">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{t.subtotal}</span>
                <span className="tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-subtle">{t.shippingNote}</p>
              <p className="text-xs text-subtle">{t.leadNote}</p>
              <div className="mt-4 grid gap-2">
                <Button asChild size="lg" onClick={close}>
                  <Link href="/checkout">{t.checkout}</Link>
                </Button>
                <Button asChild variant="ghost" onClick={close}>
                  <Link href="/cart">{t.viewCart}</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
