// import { useTheme } from '@emotion/react';
// import { CircularProgress, Skeleton } from '@mui/material';
// import React, { useState, useEffect, useMemo } from 'react';
// import { useSelector } from 'react-redux';

// import Iconify from '../components/iconify';
// import NavAccount from '../layouts/dashboard/nav/NavAccount.jsx';
// import { selectAccountId, selectAccountSubscriptions } from '../redux/slices/general';
// import { optimai_shop, optimai } from '../utils/axios';

// export default function PayAsYouGoPricing() {
//   const PLATFORM_ID = 'e3334518-6749-48e3-b74f-8acb3f6c04ce';
//   const AI_ID = '9d826b30-a6a4-4552-bc47-37205abf4540';
//   const FORMS_ID = '739f42a4-cc7f-4720-b0e0-0c5953a6a00a';

//   const accountId = useSelector(selectAccountId);
//   const t = useTheme();
//   const themeMode = t.palette.mode;
//   const [pricing, setPricing] = useState(null);
//   const [selected, setSelected] = useState({});

//   useEffect(() => {
//     const fetchPricing = async () => {
//       const response = await optimai.get('/templates/pricing');
//       let data = response.data.pricing;
//       const order = [PLATFORM_ID, AI_ID, FORMS_ID];
//       data = data.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

//       // Filter for pay-as-you-go plans
//       data = data.map((group) => ({
//         ...group,
//         plans: {
//           ...group.plans,
//           items: group.plans.items.filter((plan) => plan.type === 'payg'),
//         },
//       }));

//       setPricing(data);
//     };
//     fetchPricing();
//   }, []);

//   const formatPrice = (priceInCents) =>
//     Math.floor(priceInCents / 100).toLocaleString('de-DE', {
//       style: 'currency',
//       currency: 'EUR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     });

//   // PayG Card Component
//   const PayGCard = ({ plan }) => {
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const activeSubscriptions = useSelector(selectAccountSubscriptions);

//     const isActivePlan = useMemo(() => {
//       return activeSubscriptions?.some(
//         (sub) => sub.billing_option?.plan?.id === plan.id && sub.status === 'active',
//       );
//     }, [activeSubscriptions, plan.id]);

//     const handlePurchase = async () => {
//       try {
//         setIsSubmitting(true);
//         const response = await optimai_shop.get('/stripe/purchase-credits', {
//           params: {
//             account_id: accountId,
//             plan_id: plan.id,
//           },
//         });
//         window.location.href = response.data.url;
//       } catch (error) {
//         console.error('Purchase error:', error);
//       } finally {
//         setIsSubmitting(false);
//       }
//     };

//     return (
//       <div
//         className={`p-6 rounded-lg ${
//           themeMode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//         } border flex flex-col h-full`}
//       >
//         <h3
//           className={`text-2xl font-bold mb-2 ${
//             themeMode === 'dark' ? 'text-white' : 'text-gray-900'
//           }`}
//         >
//           {plan.name}
//         </h3>
//         <p className={`text-sm mb-4 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
//           {plan.description}
//         </p>

//         <div
//           className={`text-3xl font-bold mb-6 ${
//             themeMode === 'dark' ? 'text-white' : 'text-gray-900'
//           }`}
//         >
//           {formatPrice(plan.price)}
//         </div>

//         <div className="space-y-3 flex-grow mb-6">
//           <span className="text-base font-normal">{plan.credits} credits</span>
//           {plan.meta_data?.features?.map((feature, idx) => (
//             <div
//               key={idx}
//               className="flex items-center"
//             >
//               <Iconify
//                 icon="heroicons:check-20-solid"
//                 className="w-5 h-5 text-emerald-500 mr-3"
//               />
//               <span
//                 className={`text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
//               >
//                 {feature}
//               </span>
//             </div>
//           ))}
//         </div>

//         <button
//           onClick={handlePurchase}
//           disabled={isSubmitting}
//           className={`w-full py-3 px-4 rounded-full font-medium transition-all
//             ${
//               themeMode === 'dark'
//                 ? 'bg-gray-700 hover:bg-gray-600 text-white'
//                 : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
//             }`}
//         >
//           {isSubmitting ? (
//             <CircularProgress
//               size={20}
//               color="inherit"
//             />
//           ) : (
//             'Purchase Credits'
//           )}
//         </button>
//       </div>
//     );
//   };

//   // Skeleton loader for PayG cards
//   const PayGCardSkeleton = () => (
//     <div className={'p-6 rounded-lg bg-gray-800 border-gray-700 border flex flex-col h-full'}>
//       <Skeleton
//         variant="text"
//         width="80%"
//         height={32}
//         className="mb-2"
//       />
//       <Skeleton
//         variant="text"
//         width="100%"
//         height={20}
//         className="mb-4"
//       />
//       <Skeleton
//         variant="text"
//         width="60%"
//         height={48}
//         className="mb-6"
//       />
//       <div className="space-y-3 flex-grow mb-6">
//         <Skeleton
//           variant="text"
//           width="50%"
//           height={24}
//         />
//         {[1, 2, 3].map((i) => (
//           <div
//             key={i}
//             className="flex items-center"
//           >
//             <Skeleton
//               variant="circular"
//               width={20}
//               height={20}
//               className="mr-3"
//             />
//             <Skeleton
//               variant="text"
//               width="90%"
//               height={20}
//             />
//           </div>
//         ))}
//       </div>
//       <Skeleton
//         variant="rectangular"
//         width="100%"
//         height={48}
//         className="rounded-full"
//       />
//     </div>
//   );

//   return (
//     <div
//       className={`min-h-screen flex flex-col items-center justify-center ${
//         themeMode === 'dark'
//           ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100'
//           : 'bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900'
//       } font-sans`}
//     >
//       <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
//         <div className="text-center max-w-2xl mx-auto mb-8">
//           <h1
//             className={`text-4xl font-extrabold mb-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}
//           >
//             Pay As You Go <NavAccount mini />
//           </h1>
//           <p className={`text-lg mb-3 ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//             Purchase credits and use them whenever you need.
//           </p>
//         </div>

//         <div className="flex justify-center w-full">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-7xl">
//             {!pricing
//               ? [...Array(4)].map((_, index) => <PayGCardSkeleton key={index} />)
//               : pricing.flatMap((group) =>
//                   group.plans.items.map((plan) => (
//                     <PayGCard
//                       key={plan.id}
//                       plan={plan}
//                     />
//                   )),
//                 )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
