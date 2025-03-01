// Simple React components for UI elements
const Card = ({ children, className }) => {
  return <div className={`card ${className || ''}`}>{children}</div>;
};

const CardHeader = ({ children }) => {
  return <div className="card-header">{children}</div>;
};

const CardContent = ({ children }) => {
  return <div className="card-content">{children}</div>;
};

const CardTitle = ({ children }) => {
  return <div className="card-title">{children}</div>;
};

const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="alert-dialog" onClick={() => onOpenChange(false)}>
      <div className="alert-dialog-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const AlertDialogHeader = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

const AlertDialogTitle = ({ children }) => {
  return <h3 className="text-lg font-bold">{children}</h3>;
};

// Main workout tracker component
const WorkoutTracker = () => {
  const [workoutHistory, setWorkoutHistory] = React.useState(() => {
    const saved = localStorage.getItem('workoutHistory');
    return saved ? JSON.parse(saved) : {
      shoulders: null,
      chest: null,
      back: null,
      legs: null
    };
  });

  const [supersetHistory, setSupersetHistory] = React.useState(() => {
    const saved = localStorage.getItem('supersetHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = React.useState(false);
  const [backupData, setBackupData] = React.useState('');
  const [importData, setImportData] = React.useState('');
  const [selectedWorkout, setSelectedWorkout] = React.useState(null);
  const [selectedSuperset, setSelectedSuperset] = React.useState([]);

  // Main workout categories
  const mainMuscleGroups = ["chest", "back", "shoulders", "legs"];

  // Detailed categories for superset selection
  const supersetGroups = {
    "Major Muscle Groups": ["chest", "back", "shoulders"],
    "Arms": ["biceps", "triceps"],
    "Core": ["core"]
  };

  // Save to localStorage whenever histories change
  React.useEffect(() => {
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    localStorage.setItem('supersetHistory', JSON.stringify(supersetHistory));
  }, [workoutHistory, supersetHistory]);

  // Calculate days since last workout
  const calculateDaysSince = (lastWorkoutDate) => {
    if (!lastWorkoutDate) return Infinity;
    const last = new Date(lastWorkoutDate);
    const now = new Date();
    const diffTime = Math.abs(now - last);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get recommended workout based on longest rest
  const getRecommendedWorkout = () => {
    const daysSince = Object.entries(workoutHistory).map(([muscle, date]) => ({
      muscle,
      days: calculateDaysSince(date)
    }));
    
    return daysSince.reduce((prev, current) => 
      prev.days > current.days ? prev : current
    );
  };

  // Get recommended supersets
  const getRecommendedSupersets = (mainMuscle) => {
    // Get all possible superset muscles (excluding legs)
    const allSupersetMuscles = ["biceps", "triceps", "core"].concat(
      ["chest", "back", "shoulders"].filter(m => m !== mainMuscle)
    );
    
    const daysSince = allSupersetMuscles.map(muscle => ({
      muscle,
      days: calculateDaysSince(workoutHistory[muscle] || null)
    }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 2);
    
    return daysSince.map(item => item.muscle);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle logging a new workout
  const openSupersetDialog = (muscleGroup) => {
    setSelectedWorkout(muscleGroup);
    setSelectedSuperset([]);
    setIsDialogOpen(true);
  };

  const toggleSuperset = (muscle) => {
    setSelectedSuperset(prev => 
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const logWorkoutWithSuperset = () => {
    const currentDate = new Date().toISOString();
    
    setWorkoutHistory(prev => {
      const newHistory = {...prev};
      newHistory[selectedWorkout] = currentDate;
      return newHistory;
    });

    if (selectedSuperset.length > 0 && !selectedSuperset.includes('none')) {
      selectedSuperset.forEach(muscle => {
        setWorkoutHistory(prev => {
          const newHistory = {...prev};
          newHistory[muscle] = currentDate;
          return newHistory;
        });
      });

      setSupersetHistory(prev => [...prev, {
        date: currentDate,
        main: selectedWorkout,
        supersets: selectedSuperset
      }]);
    }

    setIsDialogOpen(false);
  };

  // Backup and restore functionality
  const openBackupDialog = () => {
    const data = {
      workoutHistory,
      supersetHistory
    };
    setBackupData(JSON.stringify(data));
    setIsBackupDialogOpen(true);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      if (data.workoutHistory && data.supersetHistory) {
        setWorkoutHistory(data.workoutHistory);
        setSupersetHistory(data.supersetHistory);
        setIsBackupDialogOpen(false);
        setImportData('');
        alert('Data imported successfully!');
      } else {
        alert('Invalid data format');
      }
    } catch (e) {
      alert('Invalid JSON format');
    }
  };

  const recommended = getRecommendedWorkout();
  const recommendedSupersets = getRecommendedSupersets(recommended.muscle);

  // Icons
  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  );

  const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <Card className="bg-green-50">
        <CardHeader>
          <CardTitle>
            <CalendarIcon /> Recommended Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold capitalize">{recommended.muscle}</p>
          <p className="text-sm text-gray-600 mt-2">
            Suggested supersets: {recommendedSupersets.join(', ')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <ClockIcon /> Log Today's Workout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {mainMuscleGroups.map(muscle => (
              <button
                key={muscle}
                onClick={() => openSupersetDialog(muscle)}
                className="p-2 text-sm capitalize bg-blue-100 hover:bg-blue-200 rounded transition-colors"
              >
                {muscle}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(workoutHistory).map(([muscle, date]) => (
              <div key={muscle} className="flex justify-between items-center">
                <span className="capitalize">{muscle}</span>
                <span className="text-gray-600">
                  {formatDate(date)}
                  {date && ` (${calculateDaysSince(date)} days ago)`}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <button 
          onClick={openBackupDialog}
          className="px-4 py-2 flex items-center gap-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <SaveIcon /> Backup / Restore Data
        </button>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogHeader>
          <AlertDialogTitle>Select Supersets for {selectedWorkout}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <button
              onClick={() => setSelectedSuperset(['none'])}
              className={`w-full p-2 text-sm rounded transition-colors mb-4 ${
                selectedSuperset.includes('none')
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              None
            </button>
            
            {Object.entries(supersetGroups).map(([group, muscles]) => (
              <div key={group} className="mb-4">
                <h3 className="text-sm font-semibold mb-2">{group}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {muscles
                    .filter(muscle => muscle !== selectedWorkout)
                    .map(muscle => (
                      <button
                        key={muscle}
                        onClick={() => {
                          if (selectedSuperset.includes('none')) {
                            setSelectedSuperset([muscle]);
                          } else {
                            toggleSuperset(muscle);
                          }
                        }}
                        disabled={selectedSuperset.includes('none')}
                        className={`p-2 text-sm capitalize rounded transition-colors ${
                          selectedSuperset.includes(muscle)
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 hover:bg-blue-200'
                        } ${selectedSuperset.includes('none') ? 'opacity-50' : ''}`}
                      >
                        {muscle}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={logWorkoutWithSuperset}
              className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
            >
              Save Workout
            </button>
          </div>
        </div>
      </AlertDialog>

      <AlertDialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <AlertDialogHeader>
          <AlertDialogTitle>Backup & Restore Data</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Backup Your Data</h3>
            <p className="text-sm text-gray-600 mb-2">
              Copy this code and save it somewhere safe. You can use it to restore your data later.
            </p>
            <textarea
              className="w-full p-2 border rounded h-24 text-xs"
              value={backupData}
              readOnly
            />
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Restore From Backup</h3>
            <p className="text-sm text-gray-600 mb-2">
              Paste your backup code below and click "Import" to restore your data.
            </p>
            <textarea
              className="w-full p-2 border rounded h-24 text-xs"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your backup code here..."
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsBackupDialogOpen(false)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Close
            </button>
            <button
              onClick={handleImport}
              disabled={!importData}
              className={`px-4 py-2 text-sm flex items-center gap-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${!importData ? 'opacity-50' : ''}`}
            >
              <UploadIcon /> Import
            </button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
};

// Render the app
ReactDOM.render(<WorkoutTracker />, document.getElementById('root'));
