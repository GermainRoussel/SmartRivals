import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Medal } from 'lucide-react';

const data = [
  { name: 'Lun', score: 400 },
  { name: 'Mar', score: 300 },
  { name: 'Mer', score: 550 },
  { name: 'Jeu', score: 450 },
  { name: 'Ven', score: 680 },
  { name: 'Sam', score: 0 },
  { name: 'Dim', score: 0 },
];

const leaders = [
  { rank: 1, name: 'Kasparov_AI', score: 1250, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=K' },
  { rank: 2, name: 'DeepBlue', score: 1180, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D' },
  { rank: 3, name: 'AlphaZero', score: 1120, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' },
];

export const Leaderboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="font-display text-3xl font-bold text-slate-800">Classement</h2>

      {/* Stats Graph */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-medium mb-6">Vos performances cette semaine</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="score" radius={[6, 6, 6, 6]}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 500 ? '#FBBF24' : '#3B82F6'} />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Players */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-lg font-medium">Top Joueurs du Jour</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {leaders.map((leader) => (
            <div key={leader.rank} className="flex items-center p-4 hover:bg-slate-50 transition-colors">
              <div className="w-8 text-center font-bold text-slate-400 mr-4">
                {leader.rank === 1 ? <Trophy className="text-yellow-500 mx-auto" size={24} /> : 
                 leader.rank === 2 ? <Medal className="text-slate-400 mx-auto" size={24} /> :
                 leader.rank === 3 ? <Medal className="text-amber-700 mx-auto" size={24} /> : leader.rank}
              </div>
              <img src={leader.avatar} className="w-10 h-10 rounded-full bg-slate-100 mr-4" />
              <div className="flex-1">
                <div className="font-bold text-slate-800">{leader.name}</div>
                <div className="text-xs text-slate-500">Grand Master</div>
              </div>
              <div className="font-display font-bold text-primary">{leader.score} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};