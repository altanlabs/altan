import { Box, Skeleton, Avatar, Stack } from '@mui/material';
import { fetchProduct } from '@redux/slices/products';
import { memo, useEffect, useMemo, useState } from 'react';

import { dispatch, useSelector } from '@redux/store.ts';

function getValueByRef(ref, value) {
  const keys = ref.split('.');

  for (const k of keys) {
    if (value) {
      if (typeof value === 'object' && !Array.isArray(value) && k in value) {
        value = value[k];
      } else if (typeof value === 'object' && k in value) {
        value = value[k];
      } else if (Array.isArray(value) && k.startsWith('[') && k.endsWith(']')) {
        let index = k.slice(1, -1);
        if (index) {
          try {
            index = parseInt(index, 10);
            value = value[index];
          } catch (e) {
            throw new Error('invalid index');
          }
        }
      } else {
        value = null;
        break;
      }
    } else {
      value = null; // or some default value
      break;
    }
  }

  return value;
}

const getProductAttribute = (parent, product, key) => {
  const value = getValueByRef(key, product);
  if (![{}, null, undefined, ''].includes(value)) {
    return value;
  }
  return getValueByRef(key, parent);
};

const selectProducts = (state) => state.products.products;
const selectProductsInitialized = (state) => state.products.initialized;

const ProductInfo = memo(({ product }) => {
  const parentProduct = product.parent || {};
  const variations = product.variations?.items || [];

  const image = getProductAttribute(parentProduct, product, 'additional_image_urls.[0]');
  const name = getProductAttribute(parentProduct, product, 'name');

  return (
    <Box
      sx={{
        m: 0.5,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => window.open(`https://app.altan.ai/product/${product.id}`, '_blank')}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {!!image && (
          <Avatar
            variant="rounded"
            src={image}
            alt={name}
            sx={{ mr: 1 }}
          />
        )}
        <Stack>
          <span>{name}</span>
          {variations.map((variation, index) => (
            <Box
              key={index}
              sx={{ fontSize: '0.9em', color: 'text.secondary' }}
            >
              {variation.variation_type?.name}: {variation.option_value}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
});

const ProductWidget = ({ id }) => {
  const products = useSelector(selectProducts);
  const [productFetched, setProductFetched] = useState(false);

  // TODO: we should fetch all the products from the order items in streaming

  useEffect(() => {
    if (!productFetched) {
      const productExists = !!id && products.some((product) => product.id === id);
      if (!productExists && !!id) {
        dispatch(fetchProduct(id))
          .then(() => {
            setProductFetched(true);
          })
          .catch((error) => {
            console.error('Failed to fetch product', error);
            setProductFetched(true);
          });
      } else {
        setProductFetched(true);
      }
    }
  }, [id]);

  const product = useMemo(
    () => (!id ? null : products.find((product) => product.id === id)),
    [id, products],
  );

  return (
    <>
      {product ? (
        <ProductInfo product={product} />
      ) : productFetched ? (
        <div style={{ color: 'red' }}>404 Product not found</div>
      ) : (
        <Skeleton sx={{ width: '100%', height: 150 }} />
      )}
    </>
  );
};

export default memo(ProductWidget);
