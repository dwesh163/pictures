import React from 'react';

interface ProfileLayoutProps {
	children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
	return <div className="md:space-y-6 space-y-3 p-5 pb-8 md:p-10 md:pb-16">{children}</div>;
}
