import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainApp from './component/MainPage/mainpage';
import NotFound from './component/NotFound/PageNot';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NotFound />} />
        <Route exact path="/:uuid?" element={<MainApp/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
