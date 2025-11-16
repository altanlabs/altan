#!/bin/bash

# Bundle Size Analysis Script
# Provides detailed insights into build output

echo "🔍 Analyzing Bundle Sizes..."
echo ""

# Check if dist directory exists
if [ ! -d "dist/assets" ]; then
  echo "❌ dist/assets directory not found. Run 'bun run build' first."
  exit 1
fi

echo "📊 Top 20 Largest Bundles (Uncompressed):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
find dist/assets -name "*.js" -type f -exec sh -c '
  size=$(wc -c < "$1")
  name=$(basename "$1")
  printf "%60s  %12s\n" "$name" "$(numfmt --to=iec-i --suffix=B $size)"
' _ {} \; | sort -k2 -h -r | head -20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calculate total size
total_js=$(find dist/assets -name "*.js" -type f -exec cat {} \; | wc -c)
total_css=$(find dist/assets -name "*.css" -type f -exec cat {} \; | wc -c)
total_size=$((total_js + total_css))

echo "📦 Total Bundle Sizes:"
echo "  JavaScript: $(numfmt --to=iec-i --suffix=B $total_js)"
echo "  CSS:        $(numfmt --to=iec-i --suffix=B $total_css)"
echo "  Total:      $(numfmt --to=iec-i --suffix=B $total_size)"
echo ""

# Check for compressed files
if ls dist/assets/*.gz >/dev/null 2>&1; then
  total_gz=$(find dist/assets -name "*.gz" -type f -exec cat {} \; | wc -c)
  compression_ratio=$(echo "scale=1; 100 - ($total_gz * 100 / $total_size)" | bc)
  echo "📦 Compressed Sizes:"
  echo "  Gzip:       $(numfmt --to=iec-i --suffix=B $total_gz) (${compression_ratio}% reduction)"
fi

if ls dist/assets/*.br >/dev/null 2>&1; then
  total_br=$(find dist/assets -name "*.br" -type f -exec cat {} \; | wc -c)
  compression_ratio=$(echo "scale=1; 100 - ($total_br * 100 / $total_size)" | bc)
  echo "  Brotli:     $(numfmt --to=iec-i --suffix=B $total_br) (${compression_ratio}% reduction)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count chunks
num_js=$(find dist/assets -name "*.js" | wc -l | tr -d ' ')
num_css=$(find dist/assets -name "*.css" | wc -l | tr -d ' ')

echo "📈 Bundle Statistics:"
echo "  JavaScript chunks: $num_js"
echo "  CSS files:         $num_css"
echo "  Total chunks:      $((num_js + num_css))"
echo ""

# Check for large chunks
echo "⚠️  Chunks > 500KB (potential optimization targets):"
find dist/assets -name "*.js" -type f -size +500k -exec sh -c '
  size=$(wc -c < "$1")
  name=$(basename "$1")
  printf "  %60s  %12s\n" "$name" "$(numfmt --to=iec-i --suffix=B $size)"
' _ {} \; | sort -k2 -h -r

echo ""
echo "✅ Analysis complete! Open dist/stats.html for visual treemap (run with ANALYZE=true)"

