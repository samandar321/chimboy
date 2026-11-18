import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Egg, Soup, Droplet, Gift, Package, ArrowRight } from 'lucide-react';
import { localized } from '../../utils/helpers';

// Explicit icon map keyed by category slug — avoids importing the whole
// lucide-react barrel (which would bundle 1000+ icons and bloat the build).
const ICONS = {
  mayonnaises: Egg,
  ketchups: Soup,
  sauces: Droplet,
  'gift-sets': Gift,
};

export default function CategoryCard({ category }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'uz';
  const Icon = ICONS[category.slug] || Package;

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Link
        to={`/products?category=${category.slug}`}
        className="group relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-2xl bg-surface px-5 py-8 text-center shadow-card ring-1 ring-black/5 transition-all duration-300 hover:shadow-cardHover hover:ring-primary/30"
      >
        <span className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
          <Icon size={36} strokeWidth={1.75} />
        </span>
        <span className="text-base font-semibold leading-tight">{localized(category, 'name', lang)}</span>
        <ArrowRight
          size={18}
          className="text-primary opacity-0 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100"
        />
      </Link>
    </motion.div>
  );
}

CategoryCard.propTypes = { category: PropTypes.object.isRequired };
