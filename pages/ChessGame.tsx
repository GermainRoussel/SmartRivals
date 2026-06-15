import React from 'react';
import { Layout } from '../components/layout/Layout';
import ChessPuzzle from '../components/chess/ChessPuzzle';

const ChessGame: React.FC = () => {
  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chess Challenge</h1>
          <p className="text-gray-600 dark:text-gray-400">Solve the daily mate-in-1 puzzle to earn points.</p>
        </div>
        <ChessPuzzle />
      </div>
    </Layout>
  );
};

export default ChessGame;