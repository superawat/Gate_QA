import React, { useMemo, useState } from "react";
import { QuestionService } from "../../services/QuestionService";

const FilterTags = ({ tagsSelected }) => {
  const tags = useMemo(() => QuestionService.getTags(), []);
  const [selectedTags, setSelectedTags] = useState([]);
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const applyTags = (nextTags) => {
    setSelectedTags(nextTags);
    tagsSelected(nextTags);
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      applyTags(selectedTags.filter((existing) => existing !== tag));
      return;
    }

    applyTags([...selectedTags, tag]);
  };

  const filteredTags = useMemo(() => {
    const normalizedFilter = value.trim().toLowerCase();
    return tags.filter((option) =>
      option.toLowerCase().includes(normalizedFilter)
    );
  }, [tags, value]);

  const paperTags = filteredTags.filter((tag) =>
    tag.toLowerCase().startsWith("gate")
  );
  const topicTags = filteredTags.filter(
    (tag) => !tag.toLowerCase().startsWith("gate")
  );

  return (
    <div className="mb-6 mr-6 relative">
      <label
        htmlFor="filter"
        className="block mb-2 ml-3 mt-2 text-xl font-medium text-gray"
      >
        Filter:
      </label>
      <input
        onFocus={() => setIsOpen(true)}
        type="text"
        id="filter"
        className="ml-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full overflow-visible p-2"
        placeholder="gate-2023"
        onChange={(e) => setValue(e.target.value)}
        value={value}
      />

      <div className="flex flex-wrap ml-3">
        {selectedTags.map((option) => (
          <button
            type="button"
            key={option}
            className="rounded border ml-1 px-4 py-2 mr-1 mb-1 mt-1"
            onClick={() =>
              applyTags(selectedTags.filter((tag) => tag !== option))
            }
          >
            {option} x({QuestionService.getCount(option)})
          </button>
        ))}
      </div>

      {isOpen && (
        <div className="flex flex-wrap absolute top-0 left-0 z-10 bg-white border rounded-lg shadow-lg p-4">
          <button
            type="button"
            className="absolute top-2 right-2 border border-black px-2"
            onClick={() => setIsOpen(false)}
          >
            x
          </button>

          <div className="flex-none w-[300px]">
            <p className="font-bold text-xl m-2">Paper:</p>
            {paperTags.map((option) => (
              <label
                className="rounded border ml-1 px-4 py-2 mr-1 mb-1 mt-1 flex items-center gap-2"
                key={option}
                htmlFor={option}
              >
                <input
                  type="checkbox"
                  id={option}
                  checked={selectedTags.includes(option)}
                  onChange={() => toggleTag(option)}
                />
                <span>
                  {option} x({QuestionService.getCount(option)})
                </span>
              </label>
            ))}
          </div>

          <div className="flex-1">
            <p className="font-bold text-xl m-2">Tags:</p>
            <div className="flex flex-wrap">
              {topicTags.map((option) => (
                <label
                  className="rounded border ml-1 px-4 py-2 mr-1 mb-1 mt-1 flex items-center gap-2"
                  key={option}
                  htmlFor={option}
                >
                  <input
                    type="checkbox"
                    id={option}
                    checked={selectedTags.includes(option)}
                    onChange={() => toggleTag(option)}
                  />
                  <span>
                    {option} x({QuestionService.getCount(option)})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterTags;
