'use client';

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mainTasks, setMainTasks] = useState([
    {
      id: 1,
      title: "Design System Update",
      description: "Update the design system with new color palette",
      tag: "Design",
      dueDate: "Feb 1"
    },
    {
      id: 2,
      title: "User Authentication",
      description: "Implement OAuth2 for user authentication",
      tag: "Development",
      dueDate: "Feb 3"
    },
    {
      id: 3,
      title: "Dashboard Analytics",
      description: "Add analytics charts to the dashboard",
      tag: "Feature",
      dueDate: "Feb 5"
    }
  ]);

  const [quickTasks, setQuickTasks] = useState([
    {
      id: 1,
      title: "Team Meeting",
      time: "2:00 PM"
    },
    {
      id: 2,
      title: "Review PRs",
      time: "4:30 PM"
    }
  ]);

  const handleDragStart = (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ columnType, index }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dragCard = target.closest('[data-draggable="true"]');
    if (dragCard) {
      dragCard.classList.add('bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dragCard = target.closest('[data-draggable="true"]');
    if (dragCard) {
      dragCard.classList.remove('bg-blue-50');
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnType: 'main' | 'quick', targetIndex: number) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dragCard = target.closest('[data-draggable="true"]');
    if (dragCard) {
      dragCard.classList.remove('bg-blue-50');
    }

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { columnType: sourceColumnType, index: sourceIndex } = data;

    if (sourceColumnType === targetColumnType) {
      if (sourceColumnType === 'main') {
        const newTasks = [...mainTasks];
        const [movedTask] = newTasks.splice(sourceIndex, 1);
        newTasks.splice(targetIndex, 0, movedTask);
        setMainTasks(newTasks);
      } else {
        const newTasks = [...quickTasks];
        const [movedTask] = newTasks.splice(sourceIndex, 1);
        newTasks.splice(targetIndex, 0, movedTask);
        setQuickTasks(newTasks);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <div className="text-xl text-black font-semibold">SchedSync</div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative w-[280px] md:w-56 h-full bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out z-30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="hidden md:block text-xl text-black font-semibold mb-8">SchedSync</div>
          
          <nav className="flex flex-col space-y-2 flex-grow">
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Dashboard</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span>Schedule</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Calendar</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Tools</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Remainder</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              <span>Share</span>
            </button>
          </nav>
          
          <div className="mt-auto space-y-2">
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Profile</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-[#2C3E50]">Schedule</h1>
            
            {/* User Actions */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-[#2C3E50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </button>
              
              <button className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                <img 
                  src="https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-medium text-[#2C3E50]">Tasks</h2>
            </div>

            {/* Kanban Columns Container */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Main Kanban Column */}
              <div className="flex-1 bg-gray-50 p-3 md:p-4 rounded-lg min-h-[400px] md:min-h-[500px]">
                {/* Kanban Cards */}
                <div className="space-y-3 md:space-y-4">
                  {mainTasks.map((card, index) => (
                    <div 
                      key={card.id} 
                      draggable
                      data-draggable="true"
                      onDragStart={(e) => handleDragStart(e, 'main', index)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'main', index)}
                      className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-move"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-[#2C3E50] text-sm md:text-base">{card.title}</h3>
                        <button className="text-[#95A5A6] hover:text-[#7F8C8D]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                          </svg>
                        </button>
                      </div>
                      <p className="text-[#7F8C8D] text-xs md:text-sm mb-3">{card.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                          {card.tag}
                        </span>
                        <span className="text-xs text-[#95A5A6]">Due {card.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Column (Half Height) */}
              <div className="w-full md:w-80 bg-gray-50 p-3 md:p-4 rounded-lg h-[200px] md:h-[250px]">
                <h3 className="text-base md:text-lg font-medium text-[#2C3E50] mb-3 md:mb-4">Quick Tasks</h3>
                <div className="space-y-2 md:space-y-3">
                  {quickTasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      draggable
                      data-draggable="true"
                      onDragStart={(e) => handleDragStart(e, 'quick', index)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'quick', index)}
                      className="bg-white p-2 md:p-3 rounded-lg border border-gray-200 shadow-sm cursor-move"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-[#2C3E50]">{task.title}</span>
                        <span className="text-xs text-[#95A5A6]">{task.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
