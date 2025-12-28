import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  ArrowLeft, CreditCard, QrCode, FileText, Check, 
  Loader2, Shield, Lock, Copy, CheckCircle, Clock,
  Sparkles, Heart, Image, Users, Star
} from "lucide-react";
import { APP_TITLE } from "@/const";
import { paymentService, Plan, PaymentIntent, CardData } from "@/services/paymentService";

type PaymentMethod = "card" | "pix" | "boleto";
type CheckoutStep = "plan" | "payment" | "processing" | "success";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<CheckoutStep>("plan");
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  
  // Card form data
  const [cardData, setCardData] = useState<CardData>({
    number: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    holderName: ""
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const plansData = await paymentService.getPlans();
      setPlans(plansData);
      // Pre-select popular plan
      const popularPlan = plansData.find(p => p.popular);
      if (popularPlan) {
        setSelectedPlan(popularPlan);
      }
    } catch (error) {
      toast.error("Erro ao carregar planos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleContinueToPayment = async () => {
    if (!selectedPlan) {
      toast.error("Por favor, selecione um plano.");
      return;
    }

    setStep("payment");
  };

  const handlePaymentMethodChange = async (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    if (method === "pix" || method === "boleto") {
      setIsLoading(true);
      try {
        const response = await paymentService.createPaymentIntent({
          planId: selectedPlan!.id,
          paymentMethodType: method
        });
        
        if (response.success && response.paymentIntent) {
          setPaymentIntent(response.paymentIntent);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Erro ao gerar dados de pagamento.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ") : numbers;
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "number") {
      const formatted = formatCardNumber(value);
      if (formatted.replace(/\s/g, "").length <= 16) {
        setCardData(prev => ({ ...prev, number: formatted }));
      }
    } else if (name === "expMonth" || name === "expYear") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 2) {
        setCardData(prev => ({ ...prev, [name]: numbers }));
      }
    } else if (name === "cvc") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 4) {
        setCardData(prev => ({ ...prev, cvc: numbers }));
      }
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateCard = (): boolean => {
    const cardNumber = cardData.number.replace(/\s/g, "");
    
    if (cardNumber.length < 13) {
      toast.error("Número do cartão inválido.");
      return false;
    }
    
    if (!cardData.expMonth || !cardData.expYear) {
      toast.error("Data de validade inválida.");
      return false;
    }
    
    const month = parseInt(cardData.expMonth);
    if (month < 1 || month > 12) {
      toast.error("Mês de validade inválido.");
      return false;
    }
    
    if (cardData.cvc.length < 3) {
      toast.error("CVV inválido.");
      return false;
    }
    
    if (!cardData.holderName.trim()) {
      toast.error("Nome do titular é obrigatório.");
      return false;
    }
    
    return true;
  };

  const handleProcessPayment = async () => {
    if (paymentMethod === "card" && !validateCard()) {
      return;
    }

    setStep("processing");
    
    try {
      let response;
      
      if (paymentMethod === "card") {
        // Create payment intent first
        const intentResponse = await paymentService.createPaymentIntent({
          planId: selectedPlan!.id,
          paymentMethodType: "card"
        });
        
        if (!intentResponse.success || !intentResponse.paymentIntent) {
          throw new Error(intentResponse.message);
        }
        
        // Process card payment
        response = await paymentService.processCardPayment(
          intentResponse.paymentIntent.id,
          cardData
        );
      } else if (paymentMethod === "pix") {
        // For PIX, simulate waiting for payment confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));
        response = await paymentService.confirmPixPayment(paymentIntent!.id);
      } else {
        // For boleto, just show success (payment will be confirmed later)
        response = { success: true, message: "Boleto gerado com sucesso!" };
      }
      
      if (response.success) {
        setStep("success");
      } else {
        toast.error(response.message || "Erro ao processar pagamento.");
        setStep("payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento.");
      setStep("payment");
    }
  };

  const handleCopyPix = () => {
    if (paymentIntent?.pixQrCode) {
      navigator.clipboard.writeText(paymentIntent.pixQrCode);
      setPixCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "Amex";
    if (/^6(?:011|5)/.test(cleaned)) return "Discover";
    if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(cleaned)) return "Elo";
    return "";
  };

  if (isLoading && step === "plan") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => step === "plan" ? setLocation("/dashboard/family") : setStep("plan")}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === "plan" ? "Voltar" : "Voltar aos planos"}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm sm:text-base">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Pagamento Seguro</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === "plan" ? "text-teal-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "plan" ? "bg-teal-600 text-white" : "bg-teal-600 text-white"}`}>
              {step !== "plan" ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <span className="hidden sm:inline font-medium">Escolher Plano</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200">
            <div className={`h-full bg-teal-600 transition-all ${step !== "plan" ? "w-full" : "w-0"}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === "payment" || step === "processing" ? "text-teal-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "payment" || step === "processing" ? "bg-teal-600 text-white" : step === "success" ? "bg-teal-600 text-white" : "bg-gray-200"}`}>
              {step === "success" ? <Check className="w-4 h-4" /> : "2"}
            </div>
            <span className="hidden sm:inline font-medium">Pagamento</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200">
            <div className={`h-full bg-teal-600 transition-all ${step === "success" ? "w-full" : "w-0"}`}></div>
          </div>
          <div className={`flex items-center gap-2 ${step === "success" ? "text-teal-600" : "text-gray-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === "success" ? "bg-teal-600 text-white" : "bg-gray-200"}`}>
              {step === "success" ? <Check className="w-4 h-4" /> : "3"}
            </div>
            <span className="hidden sm:inline font-medium">Confirmação</span>
          </div>
        </div>

        {/* Step 1: Select Plan */}
        {step === "plan" && (
          <div className="fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Escolha seu plano</h1>
              <p className="text-gray-500">Selecione o plano ideal para preservar suas memórias</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`card-modern p-6 cursor-pointer transition-all relative ${
                    selectedPlan?.id === plan.id 
                      ? "ring-2 ring-teal-600 border-teal-600" 
                      : "hover:border-gray-300"
                  } ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Mais Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {paymentService.formatPrice(plan.price)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        /{plan.interval === "month" ? "mês" : plan.interval === "year" ? "ano" : "único"}
                      </span>
                    </div>
                    {plan.renewalPrice && plan.renewalPrice !== plan.price && (
                      <p className="text-xs text-emerald-600 mt-2 font-medium">
                        A partir do 2º ano: {paymentService.formatPrice(plan.renewalPrice)}/ano
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className={`w-full py-2 rounded-xl text-center font-medium transition-colors ${
                    selectedPlan?.id === plan.id 
                      ? "bg-teal-600 text-white" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {selectedPlan?.id === plan.id ? "Selecionado" : "Selecionar"}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button 
                className="btn-primary px-12"
                onClick={handleContinueToPayment}
                disabled={!selectedPlan}
              >
Continuar para Pagamento
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === "payment" && selectedPlan && (
          <div className="fade-in">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2">
                <div className="card-modern p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Forma de Pagamento</h2>

                  {/* Payment Method Tabs */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => handlePaymentMethodChange("card")}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "card" 
                          ? "border-teal-600 bg-teal-50 text-teal-700" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="font-medium">Cartão</span>
                    </button>
                    <button
                      onClick={() => handlePaymentMethodChange("pix")}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "pix" 
                          ? "border-teal-600 bg-teal-50 text-teal-700" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span className="font-medium">PIX</span>
                    </button>
                    <button
                      onClick={() => handlePaymentMethodChange("boleto")}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === "boleto" 
                          ? "border-teal-600 bg-teal-50 text-teal-700" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">Boleto</span>
                    </button>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número do Cartão</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="number"
                            value={cardData.number}
                            onChange={handleCardChange}
                            placeholder="0000 0000 0000 0000"
                            className="input-modern pl-12 pr-20"
                          />
                          {getCardBrand(cardData.number) && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                              {getCardBrand(cardData.number)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome no Cartão</label>
                        <input
                          type="text"
                          name="holderName"
                          value={cardData.holderName}
                          onChange={handleCardChange}
                          placeholder="Como está no cartão"
                          className="input-modern"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                          <input
                            type="text"
                            name="expMonth"
                            value={cardData.expMonth}
                            onChange={handleCardChange}
                            placeholder="MM"
                            className="input-modern text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                          <input
                            type="text"
                            name="expYear"
                            value={cardData.expYear}
                            onChange={handleCardChange}
                            placeholder="AA"
                            className="input-modern text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="cvc"
                              value={cardData.cvc}
                              onChange={handleCardChange}
                              placeholder="123"
                              className="input-modern text-center"
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Demo Notice */}
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>Modo Demonstração:</strong> Use qualquer número de cartão válido. 
                          Cartões terminados em 0000 serão recusados, e 9999 terão saldo insuficiente.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PIX */}
                  {paymentMethod === "pix" && (
                    <div className="text-center py-6">
                      {isLoading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
                          <p className="text-gray-500">Gerando QR Code PIX...</p>
                        </div>
                      ) : paymentIntent ? (
                        <>
                          <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                            <QrCode className="w-32 h-32 text-gray-800" />
                          </div>
                          <p className="text-gray-500 mb-4">Escaneie o QR Code ou copie o código abaixo</p>
                          <div className="flex items-center gap-2 max-w-md mx-auto">
                            <input
                              type="text"
                              value={paymentIntent.pixQrCode || ""}
                              readOnly
                              className="input-modern text-sm"
                            />
                            <Button
                              variant="outline"
                              className="flex-shrink-0"
                              onClick={handleCopyPix}
                            >
                              {pixCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Válido por 30 minutos</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Boleto */}
                  {paymentMethod === "boleto" && (
                    <div className="text-center py-6">
                      {isLoading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
                          <p className="text-gray-500">Gerando boleto...</p>
                        </div>
                      ) : paymentIntent ? (
                        <>
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-600" />
                          </div>
                          <p className="text-gray-900 font-medium mb-2">Boleto gerado com sucesso!</p>
                          <p className="text-gray-500 mb-4">O boleto vence em 3 dias úteis</p>
                          <div className="p-4 bg-gray-50 rounded-xl mb-4">
                            <p className="text-xs text-gray-500 mb-1">Código de barras:</p>
                            <p className="font-mono text-sm text-gray-700 break-all">{paymentIntent.boletoBarcode}</p>
                          </div>
                          <Button variant="outline" className="btn-outline">
                            Baixar Boleto PDF
                          </Button>
                          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Pagamento confirmado em até 3 dias úteis</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    className="w-full btn-primary mt-6"
                    onClick={handleProcessPayment}
                    disabled={isLoading}
                  >
                    {paymentMethod === "card" ? `Pagar ${paymentService.formatPrice(selectedPlan.price)}` :
                     paymentMethod === "pix" ? "Já fiz o PIX" :
                     "Gerar Boleto"}
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="card-modern p-6 sticky top-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
                  
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedPlan.name}</p>
                        <p className="text-sm text-gray-500">
                          {selectedPlan.interval === "one_time" ? "Pagamento único" : 
                           selectedPlan.interval === "month" ? "Cobrança mensal" : "Cobrança anual"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900">{paymentService.formatPrice(selectedPlan.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Desconto</span>
                      <span className="text-emerald-600">-R$ 0,00</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-xl text-gray-900">
                        {paymentService.formatPrice(selectedPlan.price)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="fade-in text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-teal-100 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processando pagamento...</h2>
            <p className="text-gray-500">Por favor, aguarde enquanto confirmamos seu pagamento.</p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="fade-in text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento confirmado!</h2>
            <p className="text-gray-500 mb-8">
              Seu plano {selectedPlan?.name} foi ativado com sucesso.
            </p>

            <div className="card-modern p-6 max-w-md mx-auto mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">O que você pode fazer agora:</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-teal-600" />
                  </div>
                  Criar memoriais ilimitados
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Image className="w-4 h-4 text-teal-600" />
                  </div>
                  Adicionar fotos e vídeos
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  Convidar familiares
                </li>
              </ul>
            </div>

            <Button 
              className="btn-primary px-12"
              onClick={() => setLocation("/dashboard/family")}
            >
              Ir para o Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
