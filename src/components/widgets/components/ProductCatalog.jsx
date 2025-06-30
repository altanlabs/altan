// ProductCatalog.js
import React, { useState } from 'react';

import CatalogCard from '../../components/shop/CatalogCard.jsx';
import Shop from '../../components/shop/Shop.jsx';

const ProductCatalog = ({ widget }) => {
  const data = widget?.meta_data;
  if (!data) {
    return <></>;
  }
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <CatalogCard products={data.products} onOpen={handleOpen} />
      <Shop open={open} onClose={handleClose} cartButtonText={data.cart_button_text} />
    </>
  );
};

export default ProductCatalog;
