"use client";

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from './action';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

const PostEditor = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken, authenticated } = usePrivy();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's up on politics?",
      }),
    ],
    content: '<p></p>',
  });

  const input = editor?.getText() || "";

  async function onSubmit() {
    if (!input.trim() || !authenticated) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }
      await submitPost(input, token);
      editor?.commands.clearContent();
    } catch (error) {
      console.error('Failed to submit post:', error);
      setError('Failed to submit post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Create a Project</h2>
      </div>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <User className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
          </div>
          <div className="flex-grow">
            <EditorContent editor={editor} className="w-full min-h-[100px] p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onSubmit}
            disabled={!input.trim() || isSubmitting || !authenticated}
            className="px-4 py-2 bg-green-400 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PostEditor;