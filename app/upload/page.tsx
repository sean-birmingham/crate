import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-display-l">Upload music</h1>
        <p className="mt-2 max-w-xl text-body-m text-soft">
          Add a song from your computer. Uploads are saved on this computer
          only; they stay out of Git and off the web.
        </p>
      </header>
      <UploadForm />
    </div>
  );
}
