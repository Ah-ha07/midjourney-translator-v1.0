import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';

// 导入页面组件
import Home from './pages/Home';
import Translate from './pages/Translate';
import History from './pages/History';

// 导入布局组件
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/translate" element={<Translate />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
