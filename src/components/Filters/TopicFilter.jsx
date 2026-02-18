import React, { useState } from 'react';
import { useFilters } from '../../contexts/FilterContext';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const TopicFilter = () => {
    const { structuredTags, filters, updateFilters } = useFilters();
    const { subjects = [], structuredSubtopics = {} } = structuredTags;
    const { selectedSubjects, selectedSubtopics } = filters;
    const [expandedTopics, setExpandedTopics] = useState([]);

    const toggleTopicExpand = (subjectSlug) => {
        if (expandedTopics.includes(subjectSlug)) {
            setExpandedTopics(expandedTopics.filter(t => t !== subjectSlug));
        } else {
            setExpandedTopics([...expandedTopics, subjectSlug]);
        }
    };

    const handleSubjectChange = (subjectSlug) => {
        let nextSubjects;
        if (selectedSubjects.includes(subjectSlug)) {
            nextSubjects = selectedSubjects.filter(t => t !== subjectSlug);
        } else {
            nextSubjects = [...selectedSubjects, subjectSlug];
            if (!expandedTopics.includes(subjectSlug)) {
                setExpandedTopics([...expandedTopics, subjectSlug]);
            }
        }
        updateFilters({ selectedSubjects: nextSubjects });
    };

    const handleSubtopicChange = (subtopicSlug) => {
        let nextSubtopics;
        if (selectedSubtopics.includes(subtopicSlug)) {
            nextSubtopics = selectedSubtopics.filter(t => t !== subtopicSlug);
        } else {
            nextSubtopics = [...selectedSubtopics, subtopicSlug];
        }
        updateFilters({ selectedSubtopics: nextSubtopics });
    }

    if (!subjects.length) return null;

    return (
        <div className="space-y-1">
            {subjects.map((subject) => {
                const subjectSlug = subject.slug;
                const subjectLabel = subject.label;
                const subtopics = structuredSubtopics[subjectSlug] || [];
                const isExpanded = expandedTopics.includes(subjectSlug);
                const isSelected = selectedSubjects.includes(subjectSlug);
                const hasSubtopics = subtopics.length > 0;

                return (
                    <div key={subjectSlug} className="flex flex-col">
                        <div className="flex items-center justify-between group py-1">
                            <label className="flex items-center cursor-pointer flex-grow">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={isSelected}
                                    onChange={() => handleSubjectChange(subjectSlug)}
                                />
                                <span className={`ml-3 text-sm capitalize truncate ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`} title={subjectLabel}>
                                    {subjectLabel}
                                </span>
                            </label>
                            {hasSubtopics && (
                                <button
                                    onClick={() => toggleTopicExpand(subjectSlug)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400"
                                >
                                    {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                </button>
                            )}
                        </div>

                        {hasSubtopics && isExpanded && (
                            <div className="ml-6 pl-2 border-l-2 border-gray-200 space-y-1 mt-1">
                                {subtopics.map((subtopic) => (
                                    <label key={subtopic.slug} className="flex items-center cursor-pointer py-0.5 group/sub">
                                        <input
                                            type="checkbox"
                                            className="h-3 w-3 rounded border-gray-300 text-blue-500 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-700"
                                            checked={selectedSubtopics.includes(subtopic.slug)}
                                            onChange={() => handleSubtopicChange(subtopic.slug)}
                                        />
                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 group-hover/sub:text-gray-800 dark:group-hover/sub:text-gray-200">
                                            {subtopic.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TopicFilter;
