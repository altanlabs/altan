import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Card, CardContent, Typography, List, ListItem, Divider } from '@mui/material';
import React from 'react';

function PriceEstimator({ widget: { meta_data }, theme }) {
  const { items, tax, discount, currency } = meta_data;
  const textColor = theme === 'light' ? '#333' : '#fff';

  // Calculate subtotal, tax, and discount only once
  const subtotal = items.reduce((sum, item) => sum + item.base_price * 100, 0);
  const taxAmount = (subtotal * tax.value) / 100;
  let discountAmount = 0;

  if (discount && discount.apply_on === 'total') {
    discountAmount = (subtotal * discount.value) / 100;
  }

  const total = subtotal + taxAmount - discountAmount;

  return (
    <Card sx={{ background: 'transparent', color: textColor }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Price Estimator
        </Typography>

        <List>
          {items.map(item => (
            <ListItem key={item.item_name}>
              <Typography variant="body1">{item.item_name}</Typography>
              <Typography variant="caption">{item.item_description}</Typography>
              <Typography variant="body2">${(item.base_price).toFixed(2)}</Typography>
            </ListItem>
          ))}
        </List>

        <Divider />

        <Typography variant="body2" gutterBottom>
          Tax ({tax.value}%): ${(taxAmount / 100).toFixed(2)}
        </Typography>
        {discount && discount.apply_on === 'total' && (
          <Typography variant="body2" color="error" gutterBottom>
            Discount ({discount.value}%): -${(discountAmount / 100).toFixed(2)}
          </Typography>
        )}
        <Typography variant="h6">
          <MonetizationOnIcon color="primary" fontSize="small" /> Total: ${(total / 100).toFixed(2)} {currency}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PriceEstimator;
