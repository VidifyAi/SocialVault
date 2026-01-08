# 🎯 YC Launch Plan: Money Flow + Safe Transfer
**Goal:** Enable real money flow + safe account transfer end-to-end  
**Timeline:** 4 weeks to YC-ready MVP  
**Focus:** P0 (Payment + Transfer) → P1 (Notifications) → P2 (Polish)

---

## 🔴 P0 — Critical Blockers (Week 1–2)

### 1️⃣ Fix Payment Integration (Week 1 — Days 1-3)

#### **Problem Statement**
- Frontend checkout page (`/checkout/[id]/page.tsx`) has dummy form
- Backend payment service exists but unused
- No real money can be collected → product not real

#### **Outcome Required**
✅ User can pay with real money  
✅ Money is captured in Razorpay  
✅ Order state is persisted correctly  
✅ Failure paths handled gracefully

---

#### **Day 1: Backend Payment Flow**

**Tasks:**

1. **Verify Payment Service** (`apps/backend/src/services/payment.service.ts`)
   - ✅ Already has `createOrder()`, `capturePayment()`, `verifyPaymentSignature()`
   - ✅ Already has webhook handler
   - **Action:** Review and ensure all methods work correctly

2. **Add Payment Status Endpoint** (if missing)
   ```typescript
   // apps/backend/src/routes/payment.routes.ts
   // GET /payments/:transactionId/status - Already exists, verify it works
   ```

3. **Test Payment Service Locally**
   - Use Razorpay test keys
   - Test order creation
   - Test payment verification
   - Test webhook signature verification

**Files to Modify:**
- `apps/backend/src/services/payment.service.ts` (review)
- `apps/backend/src/routes/payment.routes.ts` (verify endpoints)

**Definition of Done:**
- ✅ Can create Razorpay order via API
- ✅ Can verify payment signature
- ✅ Webhook handler processes events

---

#### **Day 2: Frontend Razorpay Integration**

**Tasks:**

1. **Install Razorpay Checkout** (if not already)
   ```bash
   cd apps/frontend
   pnpm add razorpay
   ```

2. **Replace Dummy Checkout Form** (`apps/frontend/src/app/checkout/[id]/page.tsx`)

   **Current State:** Has dummy card form (lines 232-281)

   **New Implementation:**
   ```typescript
   // Replace the entire payment form section with:
   
   const handlePayment = async () => {
     if (!agreedToTerms) {
       toast({ title: 'Terms required', variant: 'destructive' });
       return;
     }

     setProcessing(true);
     try {
       // Step 1: Create transaction (if not exists)
       let transactionId = transaction?.id;
       if (!transactionId) {
         const txResponse = await transactionsApi.create(listing.id);
         transactionId = txResponse.data.id;
       }

       // Step 2: Create Razorpay order
       const orderResponse = await api.post('/payments/create-order', {
         transactionId,
       });

       const { orderId, amount, currency, keyId } = orderResponse.data.data;

       // Step 3: Open Razorpay Checkout
       const options = {
         key: keyId, // From backend
         amount: amount, // In paise
         currency: currency,
         name: 'SocialVault',
         description: `Purchase: ${listing.title}`,
         order_id: orderId,
         handler: async function (response: any) {
           // Step 4: Verify payment on backend
           try {
             await api.post('/payments/verify', {
               transactionId,
               razorpayOrderId: response.razorpay_order_id,
               razorpayPaymentId: response.razorpay_payment_id,
               razorpaySignature: response.razorpay_signature,
             });

             toast({
               title: 'Payment successful!',
               description: 'Redirecting to transaction...',
             });
             router.push(`/dashboard/transactions/${transactionId}`);
           } catch (error: any) {
             toast({
               title: 'Payment verification failed',
               description: error.response?.data?.error || 'Please contact support',
               variant: 'destructive',
             });
           }
         },
         prefill: {
           name: user?.firstName || user?.username,
           email: user?.email,
         },
         theme: {
           color: '#0ea5e9',
         },
         modal: {
           ondismiss: function() {
             setProcessing(false);
           },
         },
       };

       const razorpay = new (window as any).Razorpay(options);
       razorpay.on('payment.failed', function (response: any) {
         toast({
           title: 'Payment failed',
           description: response.error.description || 'Please try again',
           variant: 'destructive',
         });
         setProcessing(false);
       });
       razorpay.open();
     } catch (error: any) {
       toast({
         title: 'Error',
         description: error.response?.data?.error || 'Failed to initiate payment',
         variant: 'destructive',
       });
       setProcessing(false);
     }
   };
   ```

3. **Add Razorpay Script to Layout**
   ```typescript
   // apps/frontend/src/app/layout.tsx
   // Add in <head>:
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

4. **Update Checkout Page State**
   - Remove dummy form fields
   - Add transaction state management
   - Add loading states

**Files to Modify:**
- `apps/frontend/src/app/checkout/[id]/page.tsx` (major rewrite)
- `apps/frontend/src/app/layout.tsx` (add Razorpay script)
- `apps/frontend/package.json` (add razorpay types if needed)

**Definition of Done:**
- ✅ Checkout page shows "Pay ₹X" button (no dummy form)
- ✅ Clicking button opens Razorpay Checkout
- ✅ Payment success redirects to transaction page
- ✅ Payment failure shows error message

---

#### **Day 3: Payment Flow Testing & Edge Cases**

**Tasks:**

1. **Test Happy Path**
   - Create listing
   - Go to checkout
   - Pay with test card (4111 1111 1111 1111)
   - Verify transaction status updates
   - Verify escrow status = "funded"

2. **Test Failure Cases**
   - Payment declined card
   - Payment cancelled
   - Network error during payment
   - Webhook failure

3. **Add Payment Status Polling** (optional but recommended)
   ```typescript
   // In transaction detail page, poll payment status if pending
   useEffect(() => {
     if (transaction?.paymentStatus === 'pending') {
       const interval = setInterval(async () => {
         const status = await api.get(`/payments/${transaction.id}/status`);
         if (status.data.paymentStatus !== 'pending') {
           fetchTransaction(); // Refresh
           clearInterval(interval);
         }
       }, 5000);
       return () => clearInterval(interval);
     }
   }, [transaction?.paymentStatus]);
   ```

4. **Admin Payment View**
   - Verify admin can see payment records
   - Verify payment status in admin transaction view

**Files to Modify:**
- `apps/frontend/src/app/dashboard/transactions/[id]/page.tsx` (add status polling)
- `apps/frontend/src/app/admin/transactions/page.tsx` (verify payment display)

**Definition of Done:**
- ✅ Real ₹1 test payment works end-to-end
- ✅ Transaction shows "Paid" status
- ✅ Admin can see payment record
- ✅ Failure cases handled gracefully

**YC Lens:** ✅ "Can you charge a customer today?" → **YES**

---

### 2️⃣ Build Transfer Workflow UI (Week 1–2 — Days 4-7)

#### **Problem Statement**
- Transfer logic exists in backend (`transaction.service.ts`)
- Transfer steps defined per platform
- No guided UI for buyer/seller
- No way to track progress

#### **Outcome Required**
✅ Step-by-step transfer flow that reduces disputes  
✅ Seller can mark steps complete with proof  
✅ Buyer can verify and confirm  
✅ Escrow releases after completion

---

#### **Day 4: Backend Transfer State Machine**

**Tasks:**

1. **Review Transfer Service** (`apps/backend/src/services/transaction.service.ts`)
   - ✅ Already has `completeTransferStep()`
   - ✅ Already has `confirmTransferComplete()`
   - ✅ Transfer steps defined per platform
   - **Action:** Verify state machine is correct

2. **Add Transfer Step Upload Endpoint** (if missing)
   ```typescript
   // apps/backend/src/routes/transaction.routes.ts
   // POST /transactions/:id/transfer/steps/:stepNumber/complete
   router.post(
     '/:id/transfer/steps/:stepNumber/complete',
     authenticate,
     upload.single('proof'),
     async (req: AuthenticatedRequest, res: Response) => {
       const { id, stepNumber } = req.params;
       const proofUrl = req.file ? await uploadService.uploadFile(req.file) : undefined;
       
       const transaction = await transactionService.completeTransferStep(
         id,
         parseInt(stepNumber),
         req.user!.userId,
         {
           proofUrl,
           notes: req.body.notes,
         }
       );
       
       res.json({ success: true, data: transaction });
     }
   );
   ```

3. **Add Transfer Status Endpoint**
   ```typescript
   // GET /transactions/:id/transfer/status
   router.get(
     '/:id/transfer/status',
     authenticate,
     async (req: AuthenticatedRequest, res: Response) => {
       const transaction = await transactionService.getById(
         req.params.id,
         req.user!.userId
       );
       
       const transferProgress = transaction.transferProgress as any[];
       const currentStep = transferProgress.find(s => s.status === 'in_progress');
       
       res.json({
         success: true,
         data: {
           currentStep: transaction.currentStep,
           totalSteps: transferProgress.length,
           steps: transferProgress,
           status: transaction.status,
         },
       });
     }
   );
   ```

**Files to Modify:**
- `apps/backend/src/routes/transaction.routes.ts` (add endpoints)
- `apps/backend/src/services/transaction.service.ts` (verify logic)

**Definition of Done:**
- ✅ Can complete transfer steps via API
- ✅ Can upload proof for each step
- ✅ State machine validates transitions

---

#### **Day 5: Frontend Transfer Workflow UI (Part 1)**

**Tasks:**

1. **Update Transaction Detail Page** (`apps/frontend/src/app/dashboard/transactions/[id]/page.tsx`)

   **Add Transfer Section:**
   ```typescript
   // After the progress steps section, add:
   
   {transaction.status === 'escrow_funded' || transaction.status === 'transfer_in_progress' ? (
     <Card className="lg:col-span-2">
       <CardHeader>
         <CardTitle>Transfer Process</CardTitle>
         <CardDescription>
           Follow these steps to complete the account transfer
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-6">
         {transferSteps.map((step, index) => {
           const stepNumber = index + 1;
           const isCompleted = step.status === 'completed';
           const isCurrent = step.status === 'in_progress';
           const isPending = step.status === 'pending';
           
           // Determine who performs this step
           const isSellerStep = stepNumber <= 2; // First 2 steps typically seller
           
           return (
             <div
               key={stepNumber}
               className={`p-4 rounded-lg border-2 ${
                 isCompleted
                   ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                   : isCurrent
                   ? 'border-primary bg-primary/5'
                   : 'border-muted bg-muted/50'
               }`}
             >
               <div className="flex items-start gap-4">
                 <div
                   className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                     isCompleted
                       ? 'bg-green-500 text-white'
                       : isCurrent
                       ? 'bg-primary text-primary-foreground'
                       : 'bg-muted text-muted-foreground'
                   }`}
                 >
                   {isCompleted ? (
                     <CheckCircle className="h-5 w-5" />
                   ) : (
                     <span className="font-medium">{stepNumber}</span>
                   )}
                 </div>
                 
                 <div className="flex-1">
                   <div className="flex items-center justify-between mb-2">
                     <h3 className="font-semibold">{step.title}</h3>
                     <Badge variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}>
                       {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                     </Badge>
                   </div>
                   
                   <p className="text-sm text-muted-foreground mb-3">
                     {step.description}
                   </p>
                   
                   {step.instructions && (
                     <ol className="list-decimal list-inside space-y-1 text-sm mb-3">
                       {step.instructions.map((instruction, i) => (
                         <li key={i}>{instruction}</li>
                       ))}
                     </ol>
                   )}
                   
                   {isCurrent && (
                     <div className="mt-4 space-y-3">
                       {(isSeller && isSellerStep) || (isBuyer && !isSellerStep) ? (
                         <TransferStepForm
                           transactionId={transaction.id}
                           stepNumber={stepNumber}
                           onComplete={() => fetchTransaction()}
                         />
                       ) : (
                         <p className="text-sm text-muted-foreground italic">
                           Waiting for {isSellerStep ? 'seller' : 'buyer'} to complete this step...
                         </p>
                       )}
                     </div>
                   )}
                   
                   {isCompleted && step.proofUrl && (
                     <div className="mt-3">
                       <a
                         href={step.proofUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-sm text-primary hover:underline"
                       >
                         View proof →
                       </a>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           );
         })}
       </CardContent>
     </Card>
   ) : null}
   ```

2. **Create TransferStepForm Component**
   ```typescript
   // apps/frontend/src/components/transfer-step-form.tsx
   'use client';
   
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';
   import { Input } from '@/components/ui/input';
   import { Label } from '@/components/ui/label';
   import { Textarea } from '@/components/ui/textarea';
   import { useToast } from '@/hooks/use-toast';
   import { api } from '@/lib/api';
   
   export function TransferStepForm({
     transactionId,
     stepNumber,
     onComplete,
   }: {
     transactionId: string;
     stepNumber: number;
     onComplete: () => void;
   }) {
     const { toast } = useToast();
     const [proof, setProof] = useState<File | null>(null);
     const [notes, setNotes] = useState('');
     const [loading, setLoading] = useState(false);
     
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       setLoading(true);
       
       try {
         const formData = new FormData();
         if (proof) formData.append('proof', proof);
         if (notes) formData.append('notes', notes);
         
         await api.post(
           `/transactions/${transactionId}/transfer/steps/${stepNumber}/complete`,
           formData,
           {
             headers: { 'Content-Type': 'multipart/form-data' },
           }
         );
         
         toast({
           title: 'Step completed!',
           description: 'The next step is now available.',
         });
         onComplete();
       } catch (error: any) {
         toast({
           title: 'Error',
           description: error.response?.data?.error || 'Failed to complete step',
           variant: 'destructive',
         });
       } finally {
         setLoading(false);
       }
     };
     
     return (
       <form onSubmit={handleSubmit} className="space-y-4">
         <div>
           <Label htmlFor="proof">Upload Proof (Screenshot)</Label>
           <Input
             id="proof"
             type="file"
             accept="image/*"
             onChange={(e) => setProof(e.target.files?.[0] || null)}
           />
           <p className="text-xs text-muted-foreground mt-1">
             Upload a screenshot showing you completed this step
           </p>
         </div>
         
         <div>
           <Label htmlFor="notes">Additional Notes (Optional)</Label>
           <Textarea
             id="notes"
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             placeholder="Any additional information..."
             rows={3}
           />
         </div>
         
         <Button type="submit" disabled={loading}>
           {loading ? 'Completing...' : 'Mark Step as Complete'}
         </Button>
       </form>
     );
   }
   ```

**Files to Modify:**
- `apps/frontend/src/app/dashboard/transactions/[id]/page.tsx` (add transfer UI)
- `apps/frontend/src/components/transfer-step-form.tsx` (new file)

**Definition of Done:**
- ✅ Transfer steps displayed in transaction page
- ✅ Current step highlighted
- ✅ Seller/buyer can complete their steps
- ✅ Proof upload works

---

#### **Day 6: Frontend Transfer Workflow UI (Part 2)**

**Tasks:**

1. **Add Buyer Confirmation Flow**
   ```typescript
   // In transaction detail page, add:
   
   {isBuyer && transaction.status === 'transfer_completed' && (
     <Card className="lg:col-span-2 border-green-500">
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <CheckCircle className="h-5 w-5 text-green-500" />
           Transfer Complete - Confirm & Release Payment
         </CardTitle>
         <CardDescription>
           Verify you have full access to the account, then confirm to release payment to seller.
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
           <p className="text-sm font-medium mb-2">Before confirming:</p>
           <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
             <li>You can log in to the account</li>
             <li>You have changed email/phone/password</li>
             <li>You have removed seller's access</li>
             <li>You have set up your own 2FA</li>
           </ul>
         </div>
         
         <Button
           onClick={handleConfirmTransfer}
           disabled={processing}
           className="w-full"
           size="lg"
         >
           {processing ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Confirming...
             </>
           ) : (
             <>
               <CheckCircle className="mr-2 h-4 w-4" />
               Confirm Transfer & Release Payment
             </>
           )}
         </Button>
         
         <Button
           variant="outline"
           onClick={() => setShowDisputeDialog(true)}
           className="w-full"
         >
           <AlertTriangle className="mr-2 h-4 w-4" />
           Something Wrong? Open Dispute
         </Button>
       </CardContent>
     </Card>
   )}
   ```

2. **Add Transfer Progress Timeline**
   - Visual timeline showing completed/pending steps
   - Progress percentage
   - Estimated time remaining

3. **Add Transfer Instructions Per Platform**
   - Show platform-specific instructions
   - Link to external guides if needed

**Files to Modify:**
- `apps/frontend/src/app/dashboard/transactions/[id]/page.tsx` (add confirmation flow)

**Definition of Done:**
- ✅ Buyer can confirm transfer completion
- ✅ Escrow releases after confirmation
- ✅ Dispute option available
- ✅ Progress timeline visible

---

#### **Day 7: Transfer Flow Testing & Edge Cases**

**Tasks:**

1. **Test Full Transfer Flow**
   - Create transaction
   - Pay (from Day 3)
   - Seller completes steps 1-2
   - Buyer completes steps 3-7
   - Buyer confirms transfer
   - Verify escrow released
   - Verify transaction status = "completed"

2. **Test Edge Cases**
   - Seller doesn't complete steps (timeout?)
   - Buyer disputes during transfer
   - Invalid proof uploaded
   - Network error during step completion

3. **Add Transfer Timeout Logic** (optional)
   ```typescript
   // In transaction service, add:
   // If transfer not started within 7 days, auto-cancel
   // If transfer in progress > 14 days, notify admin
   ```

4. **Admin Transfer View**
   - Admin can see all transfer steps
   - Admin can manually complete steps if needed
   - Admin can cancel transfer

**Files to Modify:**
- `apps/backend/src/services/transaction.service.ts` (add timeout logic)
- `apps/frontend/src/app/admin/transactions/[id]/page.tsx` (add admin view)

**Definition of Done:**
- ✅ A non-technical seller can follow the flow
- ✅ Buyer can confirm or raise dispute
- ✅ Admin can intervene
- ✅ Full transfer flow works end-to-end

**YC Lens:** ✅ "You're selling trust. This is the product." → **YES**

---

## 🟡 P1 — Trust & Communication Layer (Week 2)

### 3️⃣ Notifications System (Days 8-9)

#### **Problem Statement**
- Notification model exists in DB
- No events creating notifications
- Users are blind to important actions

#### **Outcome Required**
✅ Users are always aware of payment success, transfer started, action required, transfer completed, disputes

---

#### **Day 8: Backend Notification Creation**

**Tasks:**

1. **Create Notification Helper**
   ```typescript
   // apps/backend/src/utils/notifications.ts
   import { prisma } from '../lib/prisma';
   
   export async function createNotification(data: {
     userId: string;
     type: string;
     title: string;
     message: string;
     data?: Record<string, any>;
   }) {
     const notification = await prisma.notification.create({
       data: {
         userId: data.userId,
         type: data.type,
         title: data.title,
         message: data.message,
         data: data.data || {},
       },
     });
     
     // Emit WebSocket event
     // (Add to websocket service)
     
     return notification;
   }
   ```

2. **Add Notifications to Payment Service**
   ```typescript
   // apps/backend/src/services/payment.service.ts
   // In capturePayment(), add:
   await createNotification({
     userId: transaction.buyerId,
     type: 'payment_captured',
     title: 'Payment Successful',
     message: `Your payment of ₹${transaction.amount} has been captured.`,
     data: { transactionId: transaction.id },
   });
   
   await createNotification({
     userId: transaction.sellerId,
     type: 'escrow_funded',
     title: 'Payment Received in Escrow',
     message: `Buyer has funded the escrow. You can now begin the transfer.`,
     data: { transactionId: transaction.id },
   });
   ```

3. **Add Notifications to Transaction Service**
   - Transfer step completed
   - Transfer completed
   - Escrow released
   - Dispute opened

4. **Add Notifications to Offer Service**
   - Offer received
   - Offer accepted/rejected
   - Counter offer

5. **Add Notifications to Message Service**
   - New message received

**Files to Modify:**
- `apps/backend/src/utils/notifications.ts` (new file)
- `apps/backend/src/services/payment.service.ts`
- `apps/backend/src/services/transaction.service.ts`
- `apps/backend/src/services/offer.service.ts`
- `apps/backend/src/services/message.service.ts`
- `apps/backend/src/websocket/index.ts` (emit events)

**Definition of Done:**
- ✅ Notifications created for all critical events
- ✅ WebSocket events emitted
- ✅ No critical action happens silently

---

#### **Day 9: Frontend Notification Center**

**Tasks:**

1. **Create Notification Bell Component**
   ```typescript
   // apps/frontend/src/components/notification-bell.tsx
   'use client';
   
   import { useState, useEffect } from 'react';
   import { Bell } from 'lucide-react';
   import { Badge } from '@/components/ui/badge';
   import { api } from '@/lib/api';
   
   export function NotificationBell() {
     const [unreadCount, setUnreadCount] = useState(0);
     
     useEffect(() => {
       fetchUnreadCount();
       // Poll every 30 seconds
       const interval = setInterval(fetchUnreadCount, 30000);
       return () => clearInterval(interval);
     }, []);
     
     const fetchUnreadCount = async () => {
       try {
         const res = await api.get('/notifications/unread-count');
         setUnreadCount(res.data.count || 0);
       } catch (error) {
         console.error('Failed to fetch unread count:', error);
       }
     };
     
     return (
       <button className="relative">
         <Bell className="h-5 w-5" />
         {unreadCount > 0 && (
           <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
             {unreadCount > 9 ? '9+' : unreadCount}
           </Badge>
         )}
       </button>
     );
   }
   ```

2. **Create Notification Panel**
   ```typescript
   // apps/frontend/src/components/notification-panel.tsx
   // Full notification list with mark as read
   ```

3. **Add to Navbar**
   ```typescript
   // apps/frontend/src/components/layout/navbar.tsx
   <NotificationBell />
   ```

4. **Connect WebSocket for Real-Time**
   ```typescript
   // Use existing socket.io client
   // Listen for 'notification:new' events
   ```

**Files to Modify:**
- `apps/frontend/src/components/notification-bell.tsx` (new)
- `apps/frontend/src/components/notification-panel.tsx` (new)
- `apps/frontend/src/components/layout/navbar.tsx`
- `apps/frontend/src/app/dashboard/notifications/page.tsx` (enhance)

**Definition of Done:**
- ✅ Notification bell shows unread count
- ✅ Clicking opens notification panel
- ✅ Real-time updates via WebSocket
- ✅ Mark as read works

---

### 4️⃣ Email Notifications (Day 10)

#### **Problem Statement**
- Email service exists (`email.service.ts`)
- Never called
- No transactional emails sent

#### **Outcome Required**
✅ Email backs up in-app notifications for critical events

---

#### **Day 10: Email Integration**

**Tasks:**

1. **Call Email Service in Payment Service**
   ```typescript
   // apps/backend/src/services/payment.service.ts
   // In capturePayment(), already has email calls - verify they work
   // In releaseEscrow(), already has email calls - verify they work
   // In refundPayment(), already has email calls - verify they work
   ```

2. **Add Email to Transaction Service**
   ```typescript
   // apps/backend/src/services/transaction.service.ts
   // In completeTransferStep(), add:
   if (allComplete) {
     await emailService.sendTransferCompleteEmail({
       buyerEmail: transaction.buyer.email,
       sellerEmail: transaction.seller.email,
       // ... other fields
     });
   }
   ```

3. **Test Email Delivery**
   - Use Resend test mode
   - Send test emails
   - Verify delivery

4. **Add Email Templates** (if missing)
   - Payment confirmation
   - Transfer instructions
   - Transfer completed
   - Dispute opened

**Files to Modify:**
- `apps/backend/src/services/payment.service.ts` (verify emails sent)
- `apps/backend/src/services/transaction.service.ts` (add emails)
- `apps/backend/src/services/email.service.ts` (verify templates)

**Definition of Done:**
- ✅ Emails sent for all critical events
- ✅ Email delivery tested
- ✅ Templates look professional

**YC Lens:** ✅ "If Slack is down, do users still know what's happening?" → **YES**

---

## 🟢 P2 — Stability & YC Polish (Week 3)

### 5️⃣ Error Handling & Edge Cases (Days 11-12)

**Focus Areas:**
- Payment failures
- Seller ghosting
- Buyer inactivity
- Invalid transfers

**Tasks:**

1. **Global Error Boundaries** (Frontend)
   ```typescript
   // apps/frontend/src/components/error-boundary.tsx
   // Catch React errors gracefully
   ```

2. **Clear Error Messages**
   - Replace generic errors with user-friendly messages
   - Add error codes for support

3. **Admin Override Tools**
   - Admin can manually update transaction status
   - Admin can cancel stuck transactions
   - Admin can release escrow manually

4. **Timeout Logic**
   ```typescript
   // If payment not completed in 24 hours, cancel
   // If transfer not started in 7 days, notify seller
   // If transfer in progress > 14 days, escalate to admin
   ```

**Files to Modify:**
- `apps/frontend/src/components/error-boundary.tsx` (new)
- `apps/backend/src/services/transaction.service.ts` (add timeouts)
- `apps/frontend/src/app/admin/transactions/[id]/page.tsx` (add override tools)

---

### 6️⃣ Security & Abuse Safeguards (Day 13)

**Minimum Requirements:**
- ✅ Route guards everywhere (already done)
- ✅ Ownership checks (verify all routes)
- ✅ Rate limiting on actions (enhance)
- ✅ Audit logs for payments & transfers (add)

**Tasks:**

1. **Audit Payment Actions**
   ```typescript
   // Log all payment events
   await prisma.auditLog.create({
     data: {
       userId: req.user.id,
       action: 'payment.created',
       resource: 'transaction',
       resourceId: transactionId,
       // ...
     },
   });
   ```

2. **Enhance Rate Limiting**
   - Per-user limits on critical actions
   - Stricter limits on payment endpoints

3. **Ownership Verification**
   - Verify all routes check ownership
   - Add tests for unauthorized access

**Files to Modify:**
- `apps/backend/src/middleware/auth.ts` (enhance)
- `apps/backend/src/routes/*.routes.ts` (verify ownership checks)
- `apps/backend/src/services/payment.service.ts` (add audit logs)

---

## 🧪 Week 4 — Testing & Launch Prep

### 7️⃣ Manual End-to-End Testing (Days 14-16)

**Test Scenarios:**

1. **Happy Path**
   - Seller creates listing
   - Admin approves
   - Buyer browses and finds listing
   - Buyer makes offer
   - Seller accepts offer
   - Buyer pays
   - Seller completes transfer steps
   - Buyer completes transfer steps
   - Buyer confirms transfer
   - Escrow releases
   - Transaction completes

2. **Failure Path**
   - Payment fails
   - Seller doesn't complete steps
   - Buyer disputes
   - Admin resolves dispute

3. **Edge Cases**
   - Multiple offers
   - Payment retry
   - Transfer timeout
   - Network errors

**Create Test Accounts:**
- 1 test seller
- 1 test buyer
- 1 admin account

**Document Issues:**
- Create GitHub issues for bugs
- Prioritize fixes

---

### 8️⃣ YC-Style Demo Readiness (Days 17-18)

**Prepare Demo:**

1. **2-Minute Demo Script**
   ```
   0:00-0:20 - Show marketplace (browse listings)
   0:20-0:40 - Create listing (show verification)
   0:40-1:00 - Buy account (show payment)
   1:00-1:30 - Transfer steps (show guided flow)
   1:30-2:00 - Funds released (show completion)
   ```

2. **Real Screenshots**
   - Actual payment receipt
   - Transfer steps completed
   - Transaction completed

3. **Metrics to Show**
   - Transactions completed
   - Money processed
   - User growth (if any)

**Goal:** Show a transaction, not slides.

---

## 📊 Updated YC Readiness Projection

### **After P0 + P1 Completion:**

| Category | Before | After | Improvement |
|----------|--------|-------|-------------|
| **Core Flow** | 2/5 | 4/5 | +2 |
| **Trust & Safety** | 2/5 | 4/5 | +2 |
| **Reliability** | 2/5 | 3/5 | +1 |
| **Speed to Value** | 3/5 | 4/5 | +1 |

**Expected Score: 32–35 / 40**  
**Verdict: ✅ Strong YC-ready MVP**

---

## 🧠 Founder Advice (Real Talk)

### **You Don't Need:**
- ❌ Better scraping
- ❌ More platforms
- ❌ More features
- ❌ Perfect UI
- ❌ Advanced analytics

### **You Need:**
- ✅ Money in (payment works)
- ✅ Asset transferred (transfer UI works)
- ✅ Money out safely (escrow releases)

**Fix those and everything else compounds.**

---

## 📋 Daily Checklist

### **Week 1**
- [ ] Day 1: Backend payment flow verified
- [ ] Day 2: Razorpay Checkout integrated
- [ ] Day 3: Payment testing complete
- [ ] Day 4: Backend transfer endpoints ready
- [ ] Day 5: Transfer UI Part 1 (steps display)
- [ ] Day 6: Transfer UI Part 2 (confirmation)
- [ ] Day 7: Transfer flow testing

### **Week 2**
- [ ] Day 8: Backend notifications
- [ ] Day 9: Frontend notification center
- [ ] Day 10: Email notifications
- [ ] Day 11: Error handling
- [ ] Day 12: Edge cases
- [ ] Day 13: Security audit
- [ ] Day 14: End-to-end testing

### **Week 3-4**
- [ ] Week 3: Polish & stability
- [ ] Week 4: Testing & demo prep

---

## 🎯 Success Metrics

**By End of Week 2, You Should Have:**
- ✅ Real payment processed end-to-end
- ✅ Transfer workflow completed by test users
- ✅ Notifications working
- ✅ Emails being sent

**By End of Week 4, You Should Have:**
- ✅ All critical bugs fixed
- ✅ Demo ready
- ✅ Production deployment ready
- ✅ YC application ready

---

*This plan focuses on the 20% of work that delivers 80% of value. Everything else can wait.*

