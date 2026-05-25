@extends('app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
    @if ($status === 'success')
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="text-5xl mb-4">✅</div>
            <h1 class="text-3xl font-bold text-green-600 mb-4">Pembayaran Berhasil!</h1>
            <p class="text-gray-600 mb-6">
                Terima kasih telah menggunakan layanan Photo Booth kami. 
                Foto Anda sudah disimpan dan siap diunduh.
            </p>
            <p class="text-sm text-gray-500 mb-8">
                Nomor Pesanan: <span class="font-mono font-bold">{{ $payment->order_id ?? 'N/A' }}</span>
            </p>
            <a href="/" class="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition inline-block">
                Kembali ke Beranda
            </a>
        </div>
    @elseif ($status === 'unfinish')
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="text-5xl mb-4">⏳</div>
            <h1 class="text-3xl font-bold text-yellow-600 mb-4">Pembayaran Tertunda</h1>
            <p class="text-gray-600 mb-6">
                Pembayaran Anda masih dalam proses. 
                Silakan tunggu atau selesaikan di halaman pembayaran.
            </p>
            <p class="text-sm text-gray-500 mb-8">
                Nomor Pesanan: <span class="font-mono font-bold">{{ $payment->order_id ?? 'N/A' }}</span>
            </p>
            <a href="/" class="bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition inline-block">
                Kembali ke Beranda
            </a>
        </div>
    @else
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="text-5xl mb-4">❌</div>
            <h1 class="text-3xl font-bold text-red-600 mb-4">Pembayaran Gagal</h1>
            <p class="text-gray-600 mb-6">
                {{ $message ?? 'Pembayaran tidak berhasil diproses. Silakan coba lagi.' }}
            </p>
            <a href="/" class="bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition inline-block">
                Kembali ke Beranda
            </a>
        </div>
    @endif
</div>
@endsection
