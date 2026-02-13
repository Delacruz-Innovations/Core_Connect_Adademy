export default function CourseStatusPanel({ status, onStatusChange }) {
    const isPublished = status === 'Published';

    return (
        <div className="border p-4 rounded-sm bg-gray-50 flex items-center justify-between">
            <div>
                <h3 className="font-bold text-sm uppercase tracking-wide">Course Status</h3>
                <p className="text-xs text-gray-500 mt-1">
                    {isPublished
                        ? "This course is visible to enrolled students."
                        : "This course is hidden and in draft mode."}
                </p>
            </div>

            <div className="flex gap-2">
                {isPublished && (
                    <button
                        onClick={() => onStatusChange('Draft')}
                        className="px-3 py-1 text-xs border border-yellow-300 bg-yellow-50 text-yellow-700 font-bold rounded-sm hover:bg-yellow-100"
                    >
                        Revert to Draft
                    </button>
                )}

                {!isPublished && (
                    <button
                        onClick={() => onStatusChange('Published')}
                        className="px-3 py-1 text-xs border border-green-300 bg-green-50 text-green-700 font-bold rounded-sm hover:bg-green-100"
                    >
                        Publish Course
                    </button>
                )}
            </div>
        </div>
    );
}
