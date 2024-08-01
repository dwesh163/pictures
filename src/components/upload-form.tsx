import Image from 'next/image';
import { ChangeEvent, DragEvent, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UploadFormProps {
	onFilesChange: (files: File[]) => void;
	previewUrls: string[];
	setPreviewUrls: (urls: string[]) => void;
	clearFiles: () => void;
}

const UploadForm = ({ onFilesChange, previewUrls, setPreviewUrls, clearFiles }: UploadFormProps) => {
	const [dragging, setDragging] = useState<boolean>(false);

	const handleDrop = (e: DragEvent<HTMLFormElement>) => {
		e.preventDefault();
		setDragging(false);

		if (!e.dataTransfer.files.length) return;

		handleFiles(e.dataTransfer.files);
	};

	const handleFiles = (files: FileList) => {
		const validFiles: File[] = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file.type.startsWith('image')) {
				alert(`File with idx: ${i} is invalid`);
				continue;
			}
			validFiles.push(file);
		}

		if (validFiles.length) {
			onFilesChange(validFiles);
		}
	};

	const onFilesUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;

		if (!fileInput.files) {
			alert('No files were chosen');
			return;
		}

		handleFiles(fileInput.files);
	};

	return (
		<form
			className={`w-full p-3 border border-gray-500 border-dashed ${dragging ? 'border-blue-500' : ''}`}
			onSubmit={(e) => e.preventDefault()}
			onDragOver={(e) => {
				e.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={handleDrop}>
			{previewUrls.length > 0 ? (
				<>
					<button
						onClick={() => {
							clearFiles();
						}}
						className="mb-3 text-sm font-medium text-gray-500 transition-colors duration-300 hover:text-gray-900">
						Clear Previews
					</button>

					<ScrollArea className="h-[300px] w-full flex flex-wrap justify-start">
						<div className="flex flex-wrap justify-start">
							{previewUrls.map((previewUrl, idx) => (
								<div key={idx} className="w-1/2 p-1.5 md:w-1/4">
									<img alt="file uploader preview" src={previewUrl} className="w-[320px] object-cover" />
								</div>
							))}
						</div>
					</ScrollArea>
				</>
			) : (
				<label className="flex flex-col items-center justify-center h-full py-8 transition-colors duration-150 cursor-pointer hover:text-gray-600">
					<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
					</svg>
					<strong className="text-sm font-medium">Select images</strong>
					<input className="block w-0 h-0" name="file" type="file" onChange={onFilesUploadChange} multiple />
				</label>
			)}
		</form>
	);
};

export default UploadForm;
