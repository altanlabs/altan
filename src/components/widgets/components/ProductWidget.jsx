import { Box, Skeleton, Avatar, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { fetchProduct } from '../../redux/slices/products';
import { dispatch, useSelector } from '../../redux/store.ts';

export default function ProductWidget({ id }) {
  const { products } = useSelector((state) => state.products);
  const [productFetched, setProductFetched] = useState(false);

  useEffect(() => {
    const productExists = products.some(product => product.id === id);
    if (!productExists) {
      dispatch(fetchProduct(id)).then(() => {
        setProductFetched(true);
      }).catch((error) => {
        console.error('Failed to fetch product', error);
        setProductFetched(true);
      });
    } else {
      setProductFetched(true);
    }
  }, [dispatch, products, id]);

  const product = products.find(product => product.id === id);

  const renderProductInfo = () => {
    if (!product) return null;

    const parentProduct = product.parent || {};
    const variations = product.variations?.items || [];

    return (
      <Box
        sx={{
          m: 0.5,
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }}
        onClick={() => window.open(`https://app.altan.ai/product/${id}`, '_blank')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {(parentProduct.additional_image_urls && parentProduct.additional_image_urls.length > 0) && (
            <Avatar variant="rounded" src={parentProduct.additional_image_urls[0]} alt={parentProduct.name} sx={{ mr: 1 }} />
          )}
          <Stack>
            <span>{parentProduct.name || product.name}</span>
            {variations.map((variation, index) => (
              <Box key={index} sx={{ fontSize: '0.9em', color: 'text.secondary' }}>
                {variation.variation_type?.name}: {variation.option_value}
              </Box>
            ))}
          </Stack>

        </Box>

      </Box>
    );
  };

  return (
    <>
      {product ? (
        renderProductInfo()
      ) : productFetched ? (
        <div style={{ color: 'red' }}>404 Product not found</div>
      ) : (
        <Skeleton sx={{ width: '100%', height: 300 }} />
      )}
    </>
  );
}
