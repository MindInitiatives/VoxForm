import BankTransferForm from "@/app/components/BankTransferForm/BankTransferForm";

export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Voice-Enabled Bank Transfer
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Securely transfer money using natural language commands
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <BankTransferForm />
          </div>
        </div>
      </div>
  );
}
