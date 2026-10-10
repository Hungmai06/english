'use client';

import React, { useState, useEffect } from 'react';
import { GrammarCourse, GrammarTopic, GrammarLesson } from '@/types/grammarSystem';
import {
  getGrammarCourse,
  getTopicById,
  getLessonById,
  saveLessonToTopic,
} from '@/lib/grammarCourseStorage';
import { CourseOverviewView } from './CourseOverviewView';
import { TopicDetailView } from './TopicDetailView';
import { LessonEditorView } from './LessonEditorView';

export const GrammarAdminHub: React.FC = () => {
  const [course, setCourse] = useState<GrammarCourse>(() => getGrammarCourse());
  const [currentLevel, setCurrentLevel] = useState<'course' | 'topic' | 'lesson'>('course');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const reloadData = () => {
    setCourse(getGrammarCourse());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const activeTopic = selectedTopicId ? getTopicById(selectedTopicId) : undefined;
  const activeLesson =
    selectedTopicId && selectedLessonId
      ? getLessonById(selectedTopicId, selectedLessonId)
      : undefined;

  const handleSelectTopic = (topic: GrammarTopic) => {
    setSelectedTopicId(topic.id);
    setSelectedLessonId(null);
    setCurrentLevel('topic');
  };

  const handleSelectLesson = (lesson: GrammarLesson) => {
    setSelectedLessonId(lesson.id);
    setCurrentLevel('lesson');
  };

  const handleBackToCourse = () => {
    setSelectedTopicId(null);
    setSelectedLessonId(null);
    setCurrentLevel('course');
    reloadData();
  };

  const handleBackToTopic = () => {
    setSelectedLessonId(null);
    setCurrentLevel('topic');
    reloadData();
  };

  const handleSaveLesson = (updatedLesson: GrammarLesson) => {
    if (!selectedTopicId) return;
    saveLessonToTopic(selectedTopicId, updatedLesson);
    reloadData();
  };

  return (
    <div className="w-full">
      {/* LEVEL 1: 📚 Khóa học (Danh sách 21 chuyên đề chuẩn, mở rộng dạng hàng) */}
      {currentLevel === 'course' && (
        <CourseOverviewView
          course={course}
          onSelectTopic={handleSelectTopic}
          onSelectLessonDirect={(topic, lesson) => {
            setSelectedTopicId(topic.id);
            setSelectedLessonId(lesson.id);
            setCurrentLevel('lesson');
          }}
          onRefreshCourse={reloadData}
        />
      )}

      {/* LEVEL 2: 📂 Chuyên đề (Chi tiết chuyên đề & danh sách bài học) */}
      {currentLevel === 'topic' && activeTopic && (
        <TopicDetailView
          topic={activeTopic}
          onBackToCourse={handleBackToCourse}
          onSelectLesson={handleSelectLesson}
          onRefreshTopics={reloadData}
        />
      )}

      {/* LEVEL 3: 📖 Bài học (Đồng bộ 3 phân khu: Lí Thuyết & Ví Dụ, Bài Tập, Thi Online) */}
      {currentLevel === 'lesson' && activeTopic && activeLesson && (
        <LessonEditorView
          topicId={activeTopic.id}
          topicName={activeTopic.name}
          lesson={activeLesson}
          allLessonsInTopic={activeTopic.lessons}
          allTopics={course.topics}
          onBackToTopic={handleBackToTopic}
          onSaveLesson={handleSaveLesson}
          onSwitchLesson={(lessonId) => {
            setSelectedLessonId(lessonId);
          }}
          onRefresh={reloadData}
          onSwitchTopic={(newTopicId) => {
            const newT = course.topics.find((t) => t.id === newTopicId);
            if (newT) {
              setSelectedTopicId(newT.id);
              if (newT.lessons && newT.lessons.length > 0) {
                setSelectedLessonId(newT.lessons[0].id);
              } else {
                setSelectedLessonId(null);
                setCurrentLevel('topic');
              }
            }
          }}
        />
      )}
    </div>
  );
};
