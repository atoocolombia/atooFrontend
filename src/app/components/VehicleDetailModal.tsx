import * as Dialog from '@radix-ui/react-dialog';
import { X, Check, Battery, Gauge, Users, Zap, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from '../contexts/ThemeContext';
import { type CatalogVehicle, formatCop, getVehicleSpecSheetFilename, getVehicleSpecSheetPdf } from '../data/vehicles';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from './ui/carousel';

interface VehicleDetailModalProps {
  vehicle: CatalogVehicle | null;
  open: boolean;
  onClose: () => void;
}

export function VehicleDetailModal({ vehicle, open, onClose }: VehicleDetailModalProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const gallery = vehicle ? (vehicle.gallery.length > 0 ? vehicle.gallery : [vehicle.image]) : [];

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setActiveImage(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on('select', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!open) {
      setActiveImage(0);
      carouselApi?.scrollTo(0, true);
    }
  }, [open, carouselApi]);

  if (!vehicle) return null;

  const specSheetPdf = getVehicleSpecSheetPdf(vehicle);
  const specSheetFilename = getVehicleSpecSheetFilename(vehicle);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setActiveImage(0);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in" />
        <Dialog.Content
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[min(96vw,920px)] max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border animate-in fade-in zoom-in-95 ${
            theme === 'dark'
              ? 'bg-[#0D0F2E] border-[#1A1FE8]/25'
              : 'bg-white border-gray-200'
          }`}
        >
          <Dialog.Close
            className={`absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </Dialog.Close>

          <div className="relative bg-black/5">
            {gallery.length > 0 ? (
              <Carousel
                setApi={setCarouselApi}
                opts={{ loop: gallery.length > 1, align: 'start' }}
                className="w-full"
              >
                <CarouselContent className="-ml-0">
                  {gallery.map((src, index) => (
                    <CarouselItem key={`${src}-${index}`} className="pl-0 basis-full">
                      <div className="aspect-[16/9] overflow-hidden">
                        <ImageWithFallback
                          src={src}
                          alt={`${vehicle.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => carouselApi?.scrollPrev()}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => carouselApi?.scrollNext()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
                      aria-label="Foto siguiente"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                      {gallery.map((src, index) => (
                        <button
                          key={`dot-${src}-${index}`}
                          type="button"
                          onClick={() => carouselApi?.scrollTo(index)}
                          className={`h-1.5 rounded-full transition-all ${
                            activeImage === index ? 'w-5 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/70'
                          }`}
                          aria-label={`Ir a foto ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </Carousel>
            ) : (
              <div className="aspect-[16/9] overflow-hidden">
                <ImageWithFallback
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {vehicle.badge && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-[#1A1FE8] text-white px-3 py-1.5 rounded-full text-xs font-bold">
                <Zap className="w-3 h-3 fill-current" />
                {vehicle.badge}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div>
              <Dialog.Title className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {vehicle.name}
              </Dialog.Title>
              <Dialog.Description className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {vehicle.subtitle}
              </Dialog.Description>
            </div>

            <section>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Lo mejor que ofrece
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {vehicle.highlights.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-3 text-sm rounded-xl p-3 ${
                      theme === 'dark' ? 'bg-white/[0.04] text-gray-300' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1A1FE8]/15 border border-[#1A1FE8]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#1A1FE8]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Ficha técnica
                </h3>
                <a
                  href={specSheetPdf}
                  download={specSheetFilename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    theme === 'dark'
                      ? 'bg-[#1A1FE8]/15 text-[#8B90FF] border border-[#1A1FE8]/30 hover:bg-[#1A1FE8]/25'
                      : 'bg-[#1A1FE8]/8 text-[#1A1FE8] border border-[#1A1FE8]/20 hover:bg-[#1A1FE8]/15'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Descargar PDF
                  <Download className="w-4 h-4" />
                </a>
              </div>
              <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                También puedes abrir el documento en una pestaña nueva.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {vehicle.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 border ${
                      theme === 'dark' ? 'border-white/[0.07] bg-white/[0.03]' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{spec.label}</span>
                    <span className={`text-sm font-semibold text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon: Battery, label: 'Eléctrico' },
                  { icon: Gauge, label: 'Eficiente' },
                  { icon: Users, label: '5 puestos' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center gap-2 rounded-xl py-4 border ${
                      theme === 'dark' ? 'border-[#1A1FE8]/20 bg-[#1A1FE8]/5' : 'border-[#1A1FE8]/15 bg-[#1A1FE8]/5'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-[#1A1FE8]" />
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t ${
              theme === 'dark' ? 'border-white/[0.07]' : 'border-gray-100'
            }`}>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Desde</p>
                <p className="text-2xl font-bold text-[#1A1FE8]">
                  {formatCop(vehicle.weeklyPriceCop)}
                  <span className={`text-sm font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}> / semana</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/solicitud');
                }}
                className="px-6 py-3 bg-[#1A1FE8] text-white rounded-xl font-semibold hover:bg-[#1217C8] transition-colors shadow-[0_0_25px_rgba(26,31,232,0.35)]"
              >
                Solicitar este vehículo
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
