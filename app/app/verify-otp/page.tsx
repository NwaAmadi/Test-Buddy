import React, { Suspense } from 'react';
import VerifyOtpForm from '../../components/VerifyOtpForm';

export const dynamic = 'force-dynamic'; // prevent static rendering

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading form...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
