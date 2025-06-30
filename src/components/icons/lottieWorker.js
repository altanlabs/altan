// lottieWorker.js
import { unzipSync } from 'fflate';

const NO_JSON_FILE_ERROR = 'No JSON file found in the .lottie archive';

/**
 * Post an error message to the main thread.
 * @param {string} name - The name of the message/event.
 * @param {string} [errorMessage] - The error message to send.
 */
function sendError(name, errorMessage = NO_JSON_FILE_ERROR) {
  self.postMessage({
    name,
    success: false,
    error: errorMessage,
  });
}

/**
 * Post a success message with data to the main thread.
 * @param {string} name - The name of the message/event.
 * @param {Object} data - The data to send.
 */
function sendSuccess(name, data) {
  self.postMessage({
    name,
    success: true,
    data,
  });
}

/**
 * Unzips the buffer, finds and parses the first JSON file that
 * doesn't start with "manifest". Returns the JSON object or null.
 * @param {ArrayBuffer} buffer - The zipped .lottie buffer.
 * @returns {Object|null}
 */
function extractLottieData(buffer) {
  const unzipped = unzipSync(new Uint8Array(buffer));
  const files = Object.keys(unzipped);
  const jsonFile = files.find((file) => !file.startsWith('manifest') && file.endsWith('.json'));

  if (!jsonFile) return null;
  return new TextDecoder().decode(unzipped[jsonFile]);
  // const jsonData = new TextDecoder().decode(unzipped[jsonFile]);
  // if (!jsonData) return null;

  // // Will throw if JSON is invalid; we'll catch it upstream
  // return JSON.parse(jsonData);
}

/**
 * Filters the Lottie assets according to hover/in-reveal logic.
 * @param {Object} lottieData - The full Lottie JSON data.
 * @param {Object} propsSettings - The settings object (e.g. { hover: true }).
 * @returns {Object} - The new, possibly filtered Lottie data.
 */

// function filterAssets(name, lottieData, propsSettings) {
//   const { assets = [], markers = [], layers = [] } = lottieData;

//   const hasIn = assets.some((asset) =>
//     ['in-', 'loop-'].some((prefix) => asset.nm?.startsWith(prefix)),
//   );
//   const hasHover = assets.some((asset) => asset.nm?.startsWith('hover-'));

//   console.log('lottieData', name, lottieData);

//   // If hover is true and "hover" layer is present, remove "in-reveal" layer
//   if (propsSettings.hover && hasHover) {
//     const hoverAsset = assets.find((asset) => asset.nm && asset.nm.startsWith('hover'));
//     const hoverLayer = layers.find((layer) => layer.nm && layer.nm.includes('hover'));
//     const hoverMarker = markers.find((marker) => marker.nm && marker.nm.includes('hover'));

//     // Filter out assets starting with 'in-' or 'loop-'
//     const otherAssets = assets.filter(
//       (asset) =>
//         !(asset.nm && ['in-', 'loop-', 'hover-'].some((prefix) => asset.nm?.startsWith(prefix))),
//     );

//     const otherLayers = layers.filter(
//       (layer) =>
//         !(
//           layer.nm &&
//           (['in-', 'loop-'].some((prefix) => layer.nm?.startsWith(prefix)) ||
//             layer.nm.includes('hover'))
//         ),
//     );
//     const otherMarkers = markers.filter(
//       (marker) =>
//         !(
//           marker.cm &&
//           (['in-', 'loop-'].some((prefix) => marker.cm?.startsWith(prefix)) ||
//             marker.cm.includes('hover'))
//         ),
//     );

//     // If a hover asset exists, include it along with other filtered assets
//     const filteredAssets = hoverAsset ? [hoverAsset, ...otherAssets] : otherAssets;
//     const filteredLayers = hoverLayer ? [hoverLayer, ...otherLayers] : otherLayers;
//     const filteredMarkers = hoverMarker ? [hoverMarker, ...otherMarkers] : otherMarkers;

//     return {
//       ...lottieData,
//       assets: filteredAssets,
//       layers: filteredLayers,
//       markers: filteredMarkers,
//     };
//   }

//   // Otherwise, if "in-reveal" layer exists, remove any "hover"-prefixed layers
//   if (hasIn) {
//     return {
//       ...lottieData,
//       assets: assets.filter((asset) => !asset.nm?.startsWith('hover')),
//     };
//   }

//   // If neither condition applies, return original data
//   return lottieData;
// }

/**
 * The worker's main message handler.
 */
self.onmessage = async ({
  data: {
    name,
    buffer,
    // propsSettings
  },
}) => {
  try {
    // let lottieData;

    // Attempt to extract and parse Lottie data
    // try {
    //   lottieData = extractLottieData(buffer);
    // } catch (parseError) {
    //   // Catch JSON parsing errors specifically
    //   sendError(name, parseError.message);
    //   return;
    // }

    // // Validate the parsed Lottie data
    // if (!lottieData || typeof lottieData !== 'object' || !lottieData.assets) {
    //   sendError(name);
    //   return;
    // }

    // Filter assets according to hover/in-reveal logic
    // const filteredData = filterAssets(name, lottieData, propsSettings);

    // Send success with the final data
    // sendSuccess(name, `data:application/json;base64,${btoa(JSON.stringify(lottieData))}`);
    sendSuccess(name, `data:application/json;base64,${btoa(extractLottieData(buffer))}`);
  } catch (error) {
    // Catch any unexpected runtime errors
    sendError(name, error.message);
  }
};
