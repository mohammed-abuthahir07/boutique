import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Share2,
  Check,
} from 'lucide-react';
import publicService from '../../services/publicService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import ProductGallery from '../../components/customer/ProductGallery';
import RelatedProducts from '../../components/customer/RelatedProducts';
import ColorSelector from '../../components/customer/ColorSelector';
import SizeSelector from '../../components/customer/SizeSelector';
import QuantitySelector from '../../components/customer/QuantitySelector';
import Loader from '../../components/common/Loader';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { FALLBACK_PRODUCT_IMAGE } from '../../config/apiConfig';
import { formatPrice } from '../../utils/format';
import './ProductDetailPage.css';

function sameColor(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function sameSize(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

function variantsForColor(variants, color) {
  return (variants || []).filter((v) => v.color && sameColor(v.color, color));
}

function pickVariantForColor(colorVariants, previousSize) {
  if (!colorVariants.length) return null;
  if (previousSize) {
    const matchingSize = colorVariants.find((v) => sameSize(v.size, previousSize) && Number(v.stock) > 0);
    if (matchingSize) return matchingSize;
  }
  return colorVariants.find((v) => Number(v.stock) > 0) || colorVariants[0];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { success, error } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Selected State
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'fit', 'shipping'
  const [addingToCart, setAddingToCart] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch single product
  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await publicService.getProductById(id);
        if (isMounted) {
          if (res.success && res.product) {
            setProduct(res.product);

            const variants = res.product.variants || [];
            if (variants.length > 0) {
              const firstInStock = variants.find((v) => v.color && Number(v.stock) > 0);
              const firstColor = (firstInStock || variants[0]).color;
              setSelectedColor(firstColor);
              setSelectedVariant(pickVariantForColor(variantsForColor(variants, firstColor)));
            }
          } else {
            setErrorMessage('Product not found or unavailable');
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load product details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const availableColors = useMemo(() => {
    const seen = new Map();
    (product?.variants || []).forEach((v) => {
      if (!v.color) return;
      const key = String(v.color).trim().toLowerCase();
      if (!seen.has(key)) seen.set(key, v.color.trim());
    });
    return Array.from(seen.values());
  }, [product]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const colorVariants = variantsForColor(product?.variants, color);
    setSelectedVariant(pickVariantForColor(colorVariants, selectedVariant?.size));
    setQuantity(1);
  };

  const variantsForSelectedColor = useMemo(
    () => variantsForColor(product?.variants, selectedColor),
    [product, selectedColor]
  );

  const imagesForSelectedColor = useMemo(() => {
    if (!product) return [FALLBACK_PRODUCT_IMAGE];

    const colorImages = (product.color_images || [])
      .filter((ci) => ci.color && selectedColor && sameColor(ci.color, selectedColor))
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
      .map((ci) => ci.image)
      .filter(Boolean);

    if (colorImages.length > 0) return colorImages;
    return product.image ? [product.image] : [FALLBACK_PRODUCT_IMAGE];
  }, [product, selectedColor]);

  // Stock check
  const availableStock = selectedVariant ? Number(selectedVariant.stock) : 0;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      error('Please choose a color and size variant');
      return;
    }

    if (isOutOfStock) {
      error('Selected configuration is currently out of stock');
      return;
    }

    setAddingToCart(true);
    const res = await addToCart(product.id, selectedVariant.id, quantity);
    setAddingToCart(false);

    if (res.requireAuth) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  };

  useEffect(() => {
    if (!copiedLink) return undefined;
    const timer = setTimeout(() => setCopiedLink(false), 3000);
    return () => clearTimeout(timer);
  }, [copiedLink]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    success('Product link copied to clipboard');
  };

  if (loading) {
    return <Loader fullScreen message="Loading product..." />;
  }

  if (errorMessage || !product) {
    return (
      <div className="container product-not-found">
        <AlertCircle size={48} className="not-found-icon" />
        <h2>Product unavailable</h2>
        <p>{errorMessage || 'This product is no longer available.'}</p>
        <Link to="/shop" className="btn btn-accent btn-sm">
          Back to shop
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(product.id);

  return (
    <div className="product-detail-page">
      <Breadcrumbs
        items={[
          { label: 'Shop', link: '/shop' },
          { label: product.category_name || 'Category', link: `/shop?category=${product.category_id}` },
          { label: product.name },
        ]}
      />

      <div className="container product-detail-container">
        <div className="product-detail-grid">
          {/* Left Column: Color-Specific Product Gallery */}
          <div className="product-gallery-col">
            <ProductGallery
              key={selectedColor || 'gallery'}
              images={imagesForSelectedColor}
              altText={`${product.name}${selectedColor ? ` — ${selectedColor}` : ''}`}
            />
          </div>

          {/* Right Column: Product Config & Purchase Details */}
          <div className="product-config-col">
            <div className="product-header-info">
              {product.category_name && (
                <Link
                  to={`/shop?category=${product.category_id}`}
                  className="product-category-link"
                >
                  {product.category_name}
                </Link>
              )}
              <h1 className="product-main-title">{product.name}</h1>
              <div className="product-price-badge-wrap">
                <span className="product-detail-price">{formatPrice(product.price)}</span>
                <span className="tax-inclusive-tag">Inclusive of all taxes</span>
              </div>
            </div>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <ColorSelector
                colors={availableColors}
                selectedColor={selectedColor}
                onSelectColor={handleColorSelect}
              />
            )}

            {/* Size Selector */}
            <SizeSelector
              variants={variantsForSelectedColor}
              selectedVariant={selectedVariant}
              onSelectVariant={(v) => {
                setSelectedVariant(v);
                setQuantity(1);
              }}
            />

            {/* Stock Availability Indicator */}
            <div className="stock-indicator-row">
              {selectedVariant ? (
                availableStock > 0 ? (
                  <span className="stock-pill in-stock">
                    <Check size={14} /> In stock ({availableStock} left)
                  </span>
                ) : (
                  <span className="stock-pill out-of-stock">
                    Currently out of stock
                  </span>
                )
              ) : (
                <span className="stock-pill choose-pill">Select a size to see stock</span>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="purchase-action-panel">
              <div className="qty-row">
                <span className="qty-label">Quantity:</span>
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                  max={availableStock > 0 ? availableStock : 1}
                  min={1}
                  disabled={isOutOfStock || !selectedVariant}
                />
              </div>

              <div className="cta-button-group">
                <button
                  type="button"
                  className="btn btn-primary btn-lg add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !selectedVariant || addingToCart}
                >
                  <ShoppingBag size={18} />
                  {addingToCart ? 'Adding...' : isOutOfStock ? 'Sold out' : 'Add to Cart'}
                </button>

                <button
                  type="button"
                  className={`btn btn-outline-gold btn-lg wishlist-toggle-btn ${favorited ? 'active' : ''}`}
                  onClick={() => toggleFavorite(product.id)}
                  aria-label={favorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
                  <span>{favorited ? 'Saved' : 'Add to Wishlist'}</span>
                </button>
              </div>
            </div>

            {/* Atelier Perks */}
            <div className="atelier-perks-box">
              <div className="perk-item">
                <Truck size={18} className="perk-icon" />
                <span>Free delivery in 2–4 business days</span>
              </div>
              <div className="perk-item">
                <ShieldCheck size={18} className="perk-icon" />
                <span>Secure checkout · Genuine products</span>
              </div>
              <div className="perk-item">
                <RefreshCw size={18} className="perk-icon" />
                <span>Easy 7-day size exchange</span>
              </div>
            </div>

            {/* Share and Inquiries */}
            <div className="product-meta-actions">
              <button type="button" className="share-btn" onClick={handleShare}>
                <Share2 size={16} />
                <span>{copiedLink ? 'Link copied' : 'Share'}</span>
              </button>
              <Link to="/contact" className="inquire-link">
                Need help? Contact us
              </Link>
            </div>

            {/* Tabs: Description, Craft, Fit */}
            <div className="product-tabs-container">
              <div className="tabs-header">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Details
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'fit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('fit')}
                >
                  Size & fit
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                  onClick={() => setActiveTab('shipping')}
                >
                  Delivery
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'description' && (
                  <div className="tab-pane">
                    <p className="tab-text">
                      {product.description ||
                        'Soft, everyday wear with a clean finish. See size options above for available stock.'}
                    </p>
                    <ul className="tab-bullets">
                      <li>Colour-specific photos shown on the left</li>
                      <li>Choose size to check live stock</li>
                      <li>Ships from our boutique warehouse</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'fit' && (
                  <div className="tab-pane">
                    <p className="tab-text">
                      Regular fit. Pick your usual size. If you are between sizes, we recommend the larger one.
                    </p>
                    <p className="tab-note">
                      <strong>Need help?</strong> Message us from the Contact page with your measurements.
                    </p>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="tab-pane">
                    <p className="tab-text">
                      Free standard delivery in 2–4 business days after dispatch. You will get tracking once the order ships.
                    </p>
                    <p className="tab-text">
                      Unused items with tags can be exchanged within 7 days of delivery.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts productId={product.id} categoryId={product.category_id} />
      </div>
    </div>
  );
}
