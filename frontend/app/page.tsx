'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Sparkles, BookOpen, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="TRNT Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">TRNT</h1>
          </Link>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/register">
              <Button>시작하기</Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            만약 다른 선택을 했다면?
            <br />
            <span className="text-blue-600">평행세계의 나</span>를 만나보세요
          </h2>
          <p className="text-xl text-gray-800 mb-8 leading-relaxed font-medium">
            인생의 분기점에서 다른 선택을 했다면 어떤 삶을 살고 있을까요?
            <br />
            AI가 당신의 평행세계 이야기를 생생하게 그려드립니다.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" className="text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                무료로 시작하기
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg">
                어떻게 작동하나요?
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-12 shadow-xl">
            <div className="text-center">
              <p className="text-6xl mb-4">🌌</p>
              <p className="text-gray-800 text-lg font-medium">
                &quot;서울대 진학 대신 해외 유학을 갔다면?&quot;
                <br />
                &quot;지금 회사에 입사하지 않았다면?&quot;
                <br />
                당신의 또 다른 인생 이야기
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="how-it-works" className="container mx-auto px-4 py-16">
        <h3 className="text-4xl font-bold text-center mb-12 text-gray-900">어떻게 작동하나요?</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-900">1. 분기점 입력</h4>
            <p className="text-gray-800 leading-relaxed">
              인생의 중요한 선택 순간을 떠올려보세요. &quot;그때 다른 선택을 했다면?&quot;이라는 질문에 답해보세요.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-900">2. AI 시나리오 생성</h4>
            <p className="text-gray-800 leading-relaxed">
              당신의 프로필과 분기점을 바탕으로 AI가 생생한 평행세계 이야기를 만들어드립니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-gray-900">3. 평행세계 탐험</h4>
            <p className="text-gray-800 leading-relaxed">
              다른 선택으로 펼쳐진 당신의 평행세계를 읽어보세요. 후회도, 미련도 모두 이야기로 승화됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-black mb-6">오늘, 평행세계의 문을 열어보세요</h3>
          <p className="text-2xl mb-10 font-bold opacity-100 text-blue-50">매일 무료 3회 생성 가능</p>
          <Link href="/register">
            <Button size="lg" className="bg-white !text-blue-600 hover:bg-gray-100 font-black px-12 py-4 h-auto text-xl shadow-xl">
              지금 시작하기
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">TRNT - Time Reversal Narrative Therapy</p>
          <p className="text-sm">© 2026 TRNT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
