import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import BookingForm from "../components/BookingForm";
import { FiArrowLeft, FiCalendar, FiMapPin, FiLock, FiEye, FiEdit2 } from "react-icons/fi";

const API_BASE_URL = "https://urbanharvest-production.up.railway.app/api";

function EventDetails({ adminPreview = false }) {
  const { id } = useParams();
  const { events, loadingData } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [eventDetail, setEventDetail] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEventDetail(data);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  // Use local detail if fetched, otherwise fallback to context list
  const event = eventDetail || events.find((e) => e.id === parseInt(id));

  if (loadingData && fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rustic-green"></div>
      </div>
    );
  }

  if (!event && !fetching) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-rustic-charcoal dark:text-rustic-beige">Event not found</h1>
        <Link to={adminPreview ? "/admin/events" : "/events"} className="text-rustic-clay hover:underline mt-4 inline-block">
          {adminPreview ? "Back to Admin Events" : "Back to Events"}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-fade-in">

      {/* Admin Preview Header */}
      {adminPreview && (
        <div className="container mx-auto px-4 mt-6 mb-2">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-between shadow-sm relative z-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-lg">
                <FiEye size={20} />
              </div>
              <div>
                <p className="font-bold text-blue-800 dark:text-blue-300">Admin Preview Mode</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Viewing as a customer.</p>
              </div>
            </div>
            <Link
              to={`/admin/events/edit/${event.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <FiEdit2 /> Edit Event
            </Link>
          </div>
        </div>
      )}

      {/* Immersive Hero Header */}
      <div className="relative h-[50vh] flex items-end">
        <div className="absolute inset-0">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-rustic-mud via-rustic-mud/50 to-transparent opacity-90"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 pb-12">
          {!adminPreview && (
            <Link to="/events" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/20">
              <FiArrowLeft className="mr-2" /> All Events
            </Link>
          )}
          {adminPreview && (
            <Link to="/admin/events" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/20">
              <FiArrowLeft className="mr-2" /> Back to Admin List
            </Link>
          )}
          <span className="block text-rustic-clay font-bold tracking-widest uppercase mb-2 text-sm">{event.category} Event</span>
          <h1 className="text-3xl md:text-6xl font-serif font-bold text-white mb-6 drop-shadow-lg max-w-4xl">{event.title}</h1>

          <div className="flex flex-wrap gap-4 text-white/90 font-medium">
            <span className="flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <FiCalendar className="w-5 h-5 mr-3 text-rustic-cream" />
              {event.date ? new Date(event.date).toLocaleString("default", { month: "long", day: "numeric" }) : ""}
            </span>
            <span className="flex items-center bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <FiMapPin className="w-5 h-5 mr-3 text-rustic-cream" /> {event.location}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-rustic-mud border border-rustic-moss/10 p-8 md:p-10 shadow-xl rounded-3xl">
              <h2 className="text-2xl font-serif font-bold text-rustic-green dark:text-rustic-beige mb-6">Event Overview</h2>
              <div className="prose dark:prose-invert max-w-none mb-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg font-light">
                  {event.description}
                </p>
              </div>

              {/* Highlights Section */}
              {event.highlights && (
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-rustic-charcoal dark:text-white mb-4 flex items-center">
                    <span className="w-8 h-1 bg-rustic-clay mr-3 rounded-full"></span>
                    Event Highlights
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {event.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center bg-rustic-beige/30 dark:bg-black/20 p-4 rounded-xl border border-rustic-moss/5">
                        <div className="w-2 h-2 rounded-full bg-rustic-green mr-3"></div>
                        <span className="text-rustic-deep dark:text-rustic-beige font-medium">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda Section */}
              {event.agenda && (
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-rustic-charcoal dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-1 bg-rustic-clay mr-3 rounded-full"></span>
                    Agenda
                  </h3>
                  <div className="relative border-l-2 border-rustic-moss/20 ml-3 space-y-8 pl-8">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-rustic-mud bg-rustic-clay shadow-sm"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-rustic-deep/50 p-4 rounded-xl border border-rustic-moss/10 shadow-sm hover:shadow-md transition-shadow">
                          <span className="font-mono text-rustic-green dark:text-rustic-beige font-bold text-sm mb-1 sm:mb-0 border border-rustic-green/20 px-2 py-1 rounded-md bg-rustic-green/5 w-fit">
                            {item.time}
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 font-medium flex-grow sm:ml-4">
                            {item.activity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers Section */}
              {event.speakers && (
                <div>
                  <h3 className="text-lg font-bold text-rustic-charcoal dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-1 bg-rustic-clay mr-3 rounded-full"></span>
                    Meet Your Hosts
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-center space-x-4 bg-rustic-beige/20 dark:bg-white/5 p-4 rounded-2xl border border-rustic-moss/5 hover:bg-rustic-beige/40 transition-colors">
                        <img src={speaker.image} alt={speaker.name} className="w-16 h-16 rounded-full object-cover border-2 border-rustic-clay shadow-md" />
                        <div>
                          <h4 className="font-bold text-rustic-deep dark:text-white">{speaker.name}</h4>
                          <p className="text-sm text-rustic-moss dark:text-rustic-stone">{speaker.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block bg-rustic-green/5 dark:bg-white/5 rounded-3xl p-8 border border-rustic-moss/5">
              <h3 className="text-xl font-bold text-rustic-charcoal dark:text-white mb-4">Why Attend?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-rustic-green/10 flex items-center justify-center text-rustic-green mr-3 mt-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">Connect with like-minded eco-conscious individuals in your community.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-rustic-green/10 flex items-center justify-center text-rustic-green mr-3 mt-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">Gain practical knowledge and skills you can apply immediately for a greener life.</span>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-rustic-green/10 flex items-center justify-center text-rustic-green mr-3 mt-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">Support local sustainability initiatives and meet experts in the field.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Sticky Sidebar */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-rustic-mud border-t-4 border-rustic-clay shadow-2xl rounded-3xl p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Reserve Your Spot</h3>
                <p className="text-gray-500 text-sm text-center mb-4">Space is limited for this event.</p>

                {/* Price and Slots Indicator */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-rustic-beige/20 dark:bg-white/5 rounded-xl border border-rustic-moss/10">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Price</span>
                    <span className="text-rustic-clay font-bold text-lg">
                      {event.price === 0 || event.price === "0" || event.price === "0.00"
                        ? "Free"
                        : `LKR ${Number(event.price).toLocaleString()}`}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl text-center font-medium border ${event.slots > 0
                    ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
                    : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30"
                    }`}>
                    {event.slots > 0 ? (
                      <span>{event.slots} spots remaining!</span>
                    ) : (
                      <span>Fully Booked</span>
                    )}
                  </div>
                </div>

                {adminPreview ? (
                  <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-bold py-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center cursor-not-allowed">
                    Booking Disabled in Preview
                  </div>
                ) : user ? (
                  event.slots > 0 ? (
                    <BookingForm
                      title={event.title}
                      type="Event"
                      price={event.price}
                      eventId={event.id}
                      maxTickets={event.slots}
                      className="w-full bg-rustic-clay hover:bg-rustic-earth text-white font-bold py-4 rounded-xl shadow-lg transition-all"
                    />
                  ) : (
                    <button disabled className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed">
                      Sold Out
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-rustic-green text-white font-bold py-4 rounded-xl shadow-lg hover:bg-rustic-moss transition-all flex items-center justify-center gap-2"
                  >
                    <FiLock /> Login to Book
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                  <p className="text-xs text-gray-400">Questions? Contact <a href="#" className="underline">organizer</a></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EventDetails;
