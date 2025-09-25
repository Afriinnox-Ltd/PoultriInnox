import React from 'react'
import { Button } from './ui/button'
import { Eye, Package, ShoppingCart, Star } from 'lucide-react'
import { Badge } from './ui/badge'
import { formatCurrency } from '@/utils/formatters'
import { Card, CardContent } from './ui/card'
import { Link } from '@inertiajs/react'

function ProductCard({ product, auth, handleAddToCart }: { product: any, auth: any, handleAddToCart: (productId: number) => void }) {
  return (
    <div>
          <Card key={product.id} className="overflow-hidden pt-0 hover:shadow-lg shadow-none border transition-shadow">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                  <Link href={`/store/products/${product.slug}`}>
                      {product.images && product.images.length > 0 ? (
                          <img
                              src={product.images[0].image_path}
                              alt={product.images[0].alt_text || product.name}
                              className="w-full h-full object-cover"
                          />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-16 w-16" />
                          </div>
                      )}
                  </Link>

                  {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                      <Badge className="absolute top-2 right-2 bg-orange-500">
                          Low Stock
                      </Badge>
                  )}
                  {product.stock_quantity === 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                          Out of Stock
                      </Badge>
                  )}
              </div>

              <CardContent className="p-4">
                  <div className="space-y-2">
                      <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg line-clamp-2">
                              {product.name}
                          </h3>
                          <div className="flex items-center ml-2">
                              <Star className={`h-4 w-4 ${product.rating > 0 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              <span className="text-sm text-gray-600 ml-1">
                                  {product.rating > 0 ? product.rating.toFixed(1) : '0.0'}
                              </span>
                          </div>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2">
                          {product.description}
                      </p>

                      <div className="flex justify-between items-center">
                          <div>
                              <span className="text-2xl font-bold text-emerald-600">
                                  {formatCurrency(product.price)}
                              </span>
                              {product.min_order_quantity && (
                                  <span className="text-xs text-gray-500 ml-1">
                                      (min. {product.min_order_quantity})
                                  </span>
                              )}
                          </div>
                          <Badge variant="outline">
                              {product.stock_quantity} in stock
                          </Badge>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>by {product.vendor?.business_name}</span>
                          <span>{product.category?.name}</span>
                      </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                      <Link href={`/store/products/${product.slug}`}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 w-full"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                        </Button>
                      </Link>
                  </div>
              </CardContent>
          </Card>
    </div>
  )
}

export default ProductCard
